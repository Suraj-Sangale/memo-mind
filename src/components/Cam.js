import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import { postSiteApiFileUpload } from "@/utils/services/apiService";
// import { convertBase64ToImage } from "@/utils/utils";
import { useRouter } from "next/router";
import moment from "moment";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function FrameCompareCam({
  imageFileArray,
  setImageFileArray,
  handleShowPopup = () => {},
  setIsCustomerSelected,
  isFrameRecom = false,
  productSku,
  customerMobile,
  setPDEngineData,
  camApiLoading,
  setCamApiLoading,
  setCameraPopup,
  sapSku,
  showPopup,
}) {
  const FACING_MODE_USER = "user";
  const FACING_MODE_ENVIRONMENT = "environment";
  const webcamRef = useRef(null);

  const [stream, setStream] = useState(false);
  const [isBackCameraError, setIsBackCameraError] = useState(false);
  const [imageFile, setImageFile] = useState("");
  const [showError, setShowError] = useState("");
  const [userMediaData, setUserMediaData] = useState(null);
  const [captureImage, setCaptureImage] = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const router = useRouter();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeScanMsg, setBarcodeScanMsg] = useState("");
  const [isSkvVerified, setIsSkvVerified] = useState(false);
  const [proccedWithTryOn, setProccedWithTryOn] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  const [devices, setDevices] = useState([]);
  const isIOS = false // Detect iOS devices
  // const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent); // Detect iOS devices

  // Detect available cameras on component mount
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

  useEffect(() => {
    if (!showPopup) {
      setStream(false);
    }
  }, [showPopup]);



  const startCamera = async (mode, fallbackToFront = false) => {
    // Stop the existing stream if it exists
    if (userMediaData) {
      userMediaData.getTracks().forEach((track) => track.stop());
    }

    setCaptureImage("");
    setImageFile("");
    setUserMediaData(null);
    setStream(true);

    try {
      const constraints = {
        video: { facingMode: mode },
      };
      if (isIOS && mode == FACING_MODE_ENVIRONMENT) {
        // iOS fallback to front camera if back is not accessible
        constraints.video.facingMode = { exact: "environment" };
      }
      const userMediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setUserMediaData(userMediaStream);
      if (webcamRef.current) {
        webcamRef.current.srcObject = userMediaStream;
      }
    } catch (error) {
      setIsBackCameraError(true);
      if (fallbackToFront && mode == FACING_MODE_ENVIRONMENT) {
        // Attempt to start with front camera if back camera isn't accessible
        startCamera(FACING_MODE_USER, true);
      } else {
        setUserMediaData(null);
        handleCameraError(error);
      }
    }
  };

  const handleCameraError = (error) => {
    if (error instanceof DOMException) {
      if (error.name == "NotFoundError") {
        alert(
          "No camera found on this device. Camera functionality is not available."
        );
      } else if (error.name == "NotAllowedError") {
        alert(
          "Camera access denied. Please grant permission to use the camera."
        );
      }
    }
    handleShowPopup();
  };

  const handleClickSwitch = useCallback(() => {
    const newMode =
      facingMode == FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER;
    setFacingMode(newMode);
    startCamera(newMode, true); // Start the camera with the new mode and enable fallback
    setIsBackCameraError(false);
  }, [facingMode]);

  const convertBase64ToImage = (base64String) => {
    const matches = base64String.match(/^data:(.+);base64,(.+)/);
  
    if (matches.length !== 3) {
      console.error("Invalid Base64 image format");
    } else {
      const mimeType = matches[1];
      const imageData = matches[2];
      const buffer = Buffer.from(imageData, "base64");
      const file = new File([buffer], "image.png", { type: mimeType });
      return file;
    }
  };
  const takePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCaptureImage(imageSrc);
    let imageBlob = "";
    if (imageSrc) {
      imageBlob = convertBase64ToImage(imageSrc);
    }
    setImageFile(imageBlob);
    setStream(false);

    const tracks = webcamRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  };

  const handleClickRetakePicture = () => {
    setShowError("");
    setImageFile("");
    startCamera(facingMode, true);
  };

  const handleSubmitImage = async () => {
    const payload = new FormData();
    payload.append("sku", productSku);
    payload.append("file_data", imageFile);
    payload.append("mobile", customerMobile);
    payload.append("withFrame", true);
    setCamApiLoading(true);

    // const response = await postSiteApiFileUpload(
    //   "GET_PD_ENGINE_COORDINATES",
    //   payload
    // );
    // setShowError("");

    // if (response.status == "1" && response.data.responseCode == "0") {
    //   const capturedData = {
    //     id: response.data.id || moment().format("YYYYMMDDHHmmss"),
    //     customer_id: "0",
    //     mobile_number: customerMobile,
    //     sku: productSku,
    //     ipd: response.data.IPD,
    //     created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    //   };
    //   setPDEngineData((prev) => [...prev, capturedData]);
    //   setCamApiLoading(false);
    // } else {
    //   setCamApiLoading(false);
    //   setShowError(
    //     response.data.responseMsg || "Upload failed. Please try again."
    //   );
    // }
  };

  useEffect(() => {
    if (!imageFile) {
      startCamera(facingMode, true);
    }
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const codeReader = new BrowserMultiFormatReader();

    const captureAndDecode = async () => {
      console.log("captureAndDecode fun");
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          console.log("imageSrc", imageSrc);
          try {
            const result = await codeReader.decodeFromImageUrl(imageSrc);
            if (result.text == sapSku) {
              setIsSkvVerified(true);
            } else {
              setIsSkvVerified(false);
            }
            setBarcodeValue(result.text);
            setBarcodeScanMsg("Barcode detected!");
            setIsScanning(false);
          } catch (error) {
            setBarcodeScanMsg("Looking for Product Barcode");
          }
        }
      }
    };

    const interval = setInterval(captureAndDecode, 1000);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleRetryScan = () => {
    setBarcodeValue("");
    setIsScanning(true);
    setBarcodeScanMsg("Looking for Product Barcode");
  };
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

  return (
    <div className={["alignmentLanding"]}>
      <>
        <h1 className={"text-center " + ["title"]}>Frame Recommendation</h1>

        <div
          className={
            ["firstScreen"] + " " + ["whiteBox"] + " " + ["commonScreen"]
          }
        >
          <div className={["leftCopy"]}>
            {stream && !isBackCameraError && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  deviceId: currentDeviceId,
                  width: { ideal: 2250 },
                  height: { ideal: 1440 },
                  advanced: [{ zoom: 2 }],
                }}
                width={450}
                height={337}
                mirrored={facingMode == FACING_MODE_USER}
              />
            )}

            {isSkvVerified && proccedWithTryOn ? (
              <>
                {captureImage && (
                  <img
                    src={captureImage}
                    alt="capture-image"
                    width="450"
                    height="337"
                  />
                )}

                <div className={["captureCommonButton"]}>
                  {stream && userMediaData && !isBackCameraError && (
                    <button
                      className={`${["blackButton"]} ${["blackButton"]}`}
                      type="button"
                      onClick={takePhoto}
                    >
                      Click Photo
                    </button>
                  )}
                  {imageFile && (
                    <>
                      <button
                        className={`${["blackButton"]} ${["blackButton"]}`}
                        type="button"
                        onClick={handleSubmitImage}
                        disabled={camApiLoading}
                      >
                        {camApiLoading ? "Please wait..." : "Submit"}
                      </button>
                      <button
                        onClick={handleClickRetakePicture}
                        className={["retakeButton"]}
                        disabled={camApiLoading}
                      >
                        Retake
                      </button>
                      {showError && (
                        <span className={["errorMsg"]}>{showError}</span>
                      )}
                    </>
                  )}
                  {availableCameras.length > 1 && !imageFile && (
                    <button
                      onClick={switchCamera}
                      className={["retakeButton"]}
                    >
                      Switch to{" "}
                      {facingMode == FACING_MODE_USER ? "Back" : "Front"} Camera
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className={`${["barcodeInfo"]}`}>
                  {isScanning ? (
                    <p className={["retryButton"]}>{barcodeScanMsg}</p>
                  ) : isSkvVerified ? (
                    <>
                      <p>
                        Barcode detected: <strong>{barcodeValue}</strong>
                      </p>
                      <p>Product is matched. You may proceed to try it on.</p>

                      <button
                        className={`${["blackButton"]} ${["blackButton"]}`}
                        type="button"
                        onClick={() => {
                          setProccedWithTryOn(true);
                          setShowError("");
                          startCamera(facingMode, true);
                        }}
                      >
                        Continue
                      </button>
                    </>
                  ) : (
                    <>
                      <p>
                        Barcode Detected: <strong>{barcodeValue}</strong>
                      </p>
                      <p>Product does not match. Please try again.</p>
                      <button
                        onClick={handleRetryScan}
                        className={"mt-0 " + ["retryButton"]}
                      >
                        Retry
                      </button>
                    </>
                  )}
                </div>
                {!isSkvVerified && (
                  <button
                    className={`${["mainButton"]} ${["outlined"]} mt-3 mb-2`}
                    type="button"
                    onClick={() => {
                      setProccedWithTryOn(true);
                      setShowError("");
                      startCamera(FACING_MODE_ENVIRONMENT, true);
                      setIsScanning(false);
                      setIsSkvVerified(true);
                      setIsBackCameraError(false);
                    }}
                  >
                    Skip Barcode Verification
                  </button>
                )}
              </>
            )}

            {isBackCameraError && (
              <div className={["errorMsg"]}>
                Failed to start{" "}
                {facingMode == FACING_MODE_USER ? "Front" : "Back"} camera.
                Please make sure your device supports the selected camera mode.
              </div>
            )}
          </div>
        </div>
      </>
    </div>
  );
}
