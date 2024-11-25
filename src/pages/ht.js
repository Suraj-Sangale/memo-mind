import React, { useState } from "react";
import "react-html5-camera-photo/build/css/index.css";
import { Camera } from "react-html5-camera-photo";

const CameraComponent = () => {
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleTakePhoto = (dataUri) => {
    setCapturedImage(dataUri);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setIsFrontCamera((prev) => !prev);
  };

  return (
    <div className="camera-component">
      {!capturedImage ? (
        <>
          <Camera
            onTakePhoto={handleTakePhoto}
            idealFacingMode={isFrontCamera ? "user" : "environment"}
            isImageMirror={isFrontCamera}
          />
          <div className="controls">
            <button onClick={toggleCamera}>
              Switch to {isFrontCamera ? "Back" : "Front"}
            </button>
          </div>
        </>
      ) : (
        <div className="captured-image">
          <img src={capturedImage} alt="Captured" />
          <button onClick={handleRetake}>Retake</button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
