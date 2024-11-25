import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const CameraComponent = () => {
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const webcamRef = useRef(null);

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

  const switchCamera = async () => {
    const nextDeviceIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextDeviceIndex);

    // Update isFrontCamera based on the label of the next camera
    const isNextCameraFront = devices[nextDeviceIndex]?.label.toLowerCase().includes("front");
    setIsFrontCamera(isNextCameraFront);

    // Workaround for Firefox on Android: Restart video stream
    const nextDeviceId = devices[nextDeviceIndex]?.deviceId;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: nextDeviceId ? { exact: nextDeviceId } : undefined,
        },
      });

      // Stop the previous video tracks to release resources
      if (webcamRef.current?.video?.srcObject) {
        const tracks = webcamRef.current.video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Assign the new stream to the webcam
      webcamRef.current.video.srcObject = stream;
    } catch (err) {
      setError("Failed to switch camera.");
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
              videoConstraints={{
                deviceId: devices[currentDeviceIndex]?.deviceId,
                facingMode: isFrontCamera ? "user" : "environment",
              }}
              mirrored={isFrontCamera}
              onUserMediaError={(e) => setError(e.message || "Permission denied.")}
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
