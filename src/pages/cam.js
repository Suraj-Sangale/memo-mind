import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";

const CameraSwitcher = () => {
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [error, setError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Fetch available video input devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceInfos) => {
        const videoDevices = deviceInfos.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);

        // Set initial camera
        if (videoDevices.length === 1) {
          setCurrentDeviceId(videoDevices[0].deviceId); // Use back camera if only one
        } else if (videoDevices.length > 1) {
          setCurrentDeviceId(videoDevices[1].deviceId); // Default to front camera
        }
      })
      .catch((err) => {
        console.error("Error fetching devices:", err);
        setError("Unable to access camera devices.");
      });
  }, []);

  const switchCamera = () => {
    if (devices.length > 1) {
      try {
        const nextDeviceId = isFrontCamera
          ? devices[0].deviceId
          : devices[1].deviceId;
        setCurrentDeviceId(nextDeviceId);
        setIsFrontCamera(!isFrontCamera);
        setError(""); // Clear error on successful switch
      } catch (err) {
        console.error("Error switching camera:", err);
        setError("Error switching camera. Please try again.");
      }
    }
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {currentDeviceId ? (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={{
              deviceId: currentDeviceId,
              width: { ideal: 2250 },
              height: { ideal: 1440 },
              advanced: [{ zoom: 2 }],
            }}
            screenshotFormat="image/jpeg"
            style={{ width: "100%", maxWidth: "400px", margin: "20px 0" }}
            mirrored={isFrontCamera ? true : false}
          />
          <div>
            {devices.length > 1 && (
              <button
                onClick={switchCamera}
                style={{ marginRight: "10px" }}
              >
                Switch to {isFrontCamera ? "Back" : "Front"} Camera
              </button>
            )}
            <button onClick={captureImage}>Capture</button>
          </div>
          {capturedImage && (
            <div style={{ marginTop: "20px" }}>
              <h3>Captured Image:</h3>
              <img
                src={capturedImage}
                alt="Captured"
                style={{ width: "100%", maxWidth: "400px" }}
              />
            </div>
          )}
        </>
      ) : (
        <p>Loading camera...</p>
      )}
    </div>
  );
};

export default CameraSwitcher;
