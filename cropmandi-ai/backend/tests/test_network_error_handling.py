import socket
import requests
from app.services.plantnet_disease_service import is_network_error, classify_plantnet_error, identify_plant_image


def test_is_network_error_with_various_signatures():
    # 1. Windows socket DNS resolution error (the exact user error)
    err1 = "Gemini API returned no response: [Errno 11001] getaddrinfo failed"
    assert is_network_error(err_str=err1) is True

    # 2. Linux / Posix DNS resolution error
    err2 = "Failed to establish a new connection: [Errno -2] Name or service not known"
    assert is_network_error(err_str=err2) is True

    # 3. urllib3 / requests ConnectionError
    err3 = "Max retries exceeded with url: /v2/identify/all (Caused by NameResolutionError)"
    assert is_network_error(err_str=err3) is True

    # 4. Direct socket.gaierror exception
    exc = socket.gaierror(11001, "getaddrinfo failed")
    assert is_network_error(exc=exc) is True

    # 5. Non-network error (e.g. invalid JSON, 401 auth, etc.)
    err_json = "Invalid JSON response returned from API"
    assert is_network_error(err_str=err_json) is False


def test_classify_plantnet_error_network_detection():
    exc = socket.gaierror(11001, "getaddrinfo failed")
    status, msg = classify_plantnet_error(0, exc=exc)
    assert status == "network_error"
    assert "No internet connection" in msg


def test_identify_plant_image_fallback_network_error(monkeypatch):
    import io
    from PIL import Image

    img = Image.new("RGB", (64, 64), color="green")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    raw_bytes = buf.getvalue()

    # Mock requests.post to raise socket.gaierror
    def mock_post(*args, **kwargs):
        raise socket.gaierror(11001, "getaddrinfo failed")

    monkeypatch.setattr(requests, "post", mock_post)

    # Mock gemini service to also raise network socket error
    def mock_gemini(*args, **kwargs):
        raise socket.gaierror(11001, "getaddrinfo failed")

    import app.services.gemini_crop_disease_service as gemini_mod
    monkeypatch.setattr(gemini_mod, "analyze_crop_image", mock_gemini)

    # Simulate failing with network DNS socket failure on both services
    result, model_info = identify_plant_image(
        image_bytes=raw_bytes,
        mime_type="image/jpeg",
        selected_crop="Tomato"
    )

    assert result.analysis_status == "network_error"
    assert "Internet Connection Issue" in str(result.validation_warnings) or "getaddrinfo" in str(result.validation_warnings)
