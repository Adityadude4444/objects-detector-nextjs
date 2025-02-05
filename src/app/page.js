"use client";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef } from "react";

export default function Home() {
  const videoRef = useRef(null);

  const runDetection = async () => {
    try {
      await tf.setBackend("webgl");
      await tf.ready();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" },
      });

      if (!stream) {
        alert("Camera not found");
        return;
      }

      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => resolve();
      });

      const model = await cocoSsd.load();
      detectFrame(videoRef.current, model);
    } catch (error) {
      console.error("Error accessing the webcam or loading the model:", error);
    }
  };

  const detectFrame = async (video, model) => {
    try {
      const predictions = await model.detect(video);
      console.log(predictions);
      requestAnimationFrame(() => detectFrame(video, model));
    } catch (error) {
      console.error("Error during detection:", error);
    }
  };

  useEffect(() => {
    runDetection();
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
}
