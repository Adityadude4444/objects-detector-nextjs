"use client";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
      renderPredictions(predictions);
      requestAnimationFrame(() => detectFrame(video, model));
    } catch (error) {
      console.error("Error during detection:", error);
    }
  };

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      ctx.fillText(x, y, textWidth + 4, parseInt(font, 10) + 4);
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
    console.log(predictions);
  };

  useEffect(() => {
    runDetection();
  }, []);

  return (
    <div className="relative">
      <video
        className="absolute left-0 top-0"
        width={500}
        height={350}
        ref={videoRef}
        autoPlay
        playsInline
      ></video>
      <canvas
        className="absolute left-0 top-0"
        width={500}
        height={350}
        ref={canvasRef}
      />
    </div>
  );
}
