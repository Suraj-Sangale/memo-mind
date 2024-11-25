import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const CameraComponent = () => {
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    const getCameras = async () => {
      try {
        // Check for available video devices
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(
          (device) => device.kind === "videoinput"
        );

        if (videoDevices.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        setDevices(videoDevices);
        setCurrentDeviceId(videoDevices[0].deviceId); // Set the first camera as default
      } catch (err) {
        setError(err.message || "An error occurred while accessing cameras.");
      }
    };

    getCameras();
  }, []);

  const startCamera = (deviceId) => {
    try {
      setCurrentDeviceId(deviceId);
      setError(null);
    } catch (err) {
      setError("Failed to start the camera.");
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="camera-component">
      {!capturedImage ? (
        <>
          {devices.length > 0 && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={
                devices.length === 1
                  ? { facingMode: "user" }
                  : { deviceId: currentDeviceId }
              }
              onUserMediaError={(e) => alert(e.message || "Permission denied.")}
              //   onUserMediaError={(e) => setError(e.message || "Permission denied.")}
            />
          )}
          <div className="controls">
            {devices.length > 1 && (
              <select
                onChange={(e) => startCamera(e.target.value)}
                value={currentDeviceId}
              >
                {devices.map((device, index) => (
                  <option
                    key={index}
                    value={device.deviceId}
                  >
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            )}
            <button onClick={capturePhoto}>Capture</button>
          </div>
        </>
      ) : (
        <div className="captured-image">
          <img
            src={capturedImage}
            alt="Captured"
          />
          <button onClick={retakePhoto}>Retake</button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
