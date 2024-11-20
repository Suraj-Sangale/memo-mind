import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";

const CameraSwitcher = () => {
  const [stream, setStream] = useState(false);

  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [error, setError] = useState("");
  const [captureImage, setCaptureImage] = useState(null);
  const webcamRef = useRef(null);

  const [userMediaData, setUserMediaData] = useState(null);
  const [isBackCameraError, setIsBackCameraError] = useState(false);
  const [proccedWithTryOn, setProccedWithTryOn] = useState(false);
  const [isSkvVerified, setIsSkvVerified] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [showError, setShowError] = useState("");
  const [barcodeScanMsg, setBarcodeScanMsg] = useState("");

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
    startCamera();
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
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCaptureImage(imageSrc);
      let imageBlob = "";
      if (imageSrc) {
        imageBlob = convertBase64ToImage(imageSrc);
      }
      setImageFile(imageBlob);
      setStream(false);

      // const tracks = webcamRef.current.srcObject.getTracks();
      // tracks.forEach((track) => track.stop());
    }
  };

  const startCamera = async (mode, fallbackToFront = false) => {
    if (userMediaData) {
      userMediaData.getTracks().forEach((track) => track.stop());
    }
    setCaptureImage("");
    setImageFile("");
    setUserMediaData(null);
    setStream(true);
  };

  const handleRetryScan = () => {
    setBarcodeValue("");
    setIsScanning(true);
    setBarcodeScanMsg("Looking for Product Barcode");
  };

  const handleClickRetakePicture = () => {
    setShowError("");
    setImageFile("");
    startCamera();
  };

  const handleSubmitImage = async () => {
    const payload = new FormData();
    // payload.append("sku", productSku);
    payload.append("sku", "productSku");
    payload.append("file_data", imageFile);
    // payload.append("mobile", customerMobile);
    payload.append("mobile", "customerMobile");
    payload.append("withFrame", true);
    // setCamApiLoading(true);
    alert("payload", payload);

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

  // useEffect(() => {
  //   if (!showPopup) {
  //     setStream(false);
  //   }
  // }, [showPopup]);

  useEffect(() => {
    if (!isScanning) return;

    const codeReader = new BrowserMultiFormatReader();

    const captureAndDecode = async () => {
      // console.log("captureAndDecode fun");
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          // console.log("imageSrc", imageSrc);
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


  return (
    <div className={["alignmentLanding"]}>
      <>
        <h1 className={"text-center " + ["title"]}>Frame Recommendation</h1>
        <div
          className={
            ["firstScreen"] + " " + ["whiteBox"] + " " + ["commonScreen"]
          }
        >
          <div
            div
            className={["leftCopy"]}
          >
            {currentDeviceId && (
              <>
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
                    mirrored={devices.length == 1}
                  />
                )}
                {/*  */}
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
                      {stream && !isBackCameraError && (
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
                            // disabled={camApiLoading}
                          >
                            {/* {camApiLoading ? "Please wait..." : "Submit"} */}
                            Submit
                          </button>
                          <button
                            onClick={handleClickRetakePicture}
                            className={["retakeButton"]}
                            // disabled={camApiLoading}
                          >
                            Retake
                          </button>
                          {showError && (
                            <span className={["errorMsg"]}>{showError}</span>
                          )}
                        </>
                      )}
                      {devices.length > 1 && !imageFile && (
                        <button
                          onClick={switchCamera}
                          className={["retakeButton"]}
                        >
                          Switch to {isFrontCamera ? "Front" : "Back"}
                          Camera
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
                          <p>
                            Product is matched. You may proceed to try it on.
                          </p>

                          <button
                            className={`${["blackButton"]} ${["blackButton"]}`}
                            type="button"
                            onClick={() => {
                              setProccedWithTryOn(true);
                              setShowError("");
                              startCamera();
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
                        className={`${["mainButton"]} ${[
                          "outlined",
                        ]} mt-3 mb-2`}
                        type="button"
                        onClick={() => {
                          setProccedWithTryOn(true);
                          setShowError("");
                          startCamera();
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

                {/*  */}
              </>
            )}
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </>
    </div>
  );
};

export default CameraSwitcher;
