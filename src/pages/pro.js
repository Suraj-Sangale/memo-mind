import React, { useState, useEffect, useRef } from "react";
import Camera from "react-camera-pro";

const CameraComponent = () => {
  const cameraRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter((device) => device.kind === "videoinput");

        if (videoDevices.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        setDevices(videoDevices);

        // Default to back camera if two cameras are present
        if (videoDevices.length > 1) {
          setCurrentDeviceIndex(1); // Back camera
          setIsFrontCamera(false);
        } else {
          setCurrentDeviceIndex(0); // Single camera
          setIsFrontCamera(true); // Assume single camera is front
        }
      } catch (err) {
        setError(err.message || "An error occurred while accessing cameras.");
      }
    };

    getCameras();
  }, []);

  const switchCamera = () => {
    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextDeviceIndex);

    // Update isFrontCamera based on the label of the next camera
    const isNextCameraFront = devices[nextDeviceIndex]?.label.toLowerCase().includes("front");
    setIsFrontCamera(isNextCameraFront);
  };

  const capturePhoto = () => {
    if (cameraRef.current) {
      const image = cameraRef.current.takePhoto();
      setCapturedImage(image);
    }
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
            <Camera
              ref={cameraRef}
              facingMode={isFrontCamera ? "user" : "environment"}
              deviceId={devices[currentDeviceIndex]?.deviceId}
              aspectRatio={4 / 3}
            />
          )}
          <div className="controls">
            {devices.length > 1 && (
              <button onClick={switchCamera}>
                Switch to {isFrontCamera ? "Back" : "Front"}
              </button>
            )}
            <button onClick={capturePhoto}>Capture</button>
          </div>
        </>
      ) : (
        <div className="captured-image">
          <img src={capturedImage} alt="Captured" />
          <button onClick={retakePhoto}>Retake</button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
