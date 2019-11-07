import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export function DropImage(props) {
  const onDrop = useCallback(acceptedFiles => {
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      // Do whatever you want with the file contents
      const binaryStr = reader.result;
      var base64 = binaryStr.split(",")[1];
      props.getImage(base64);
    };

    acceptedFiles.forEach(file => reader.readAsDataURL(file));
  }, [props]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="containerDropImage" {...getRootProps()}>
      <input {...getInputProps()} />
      {props.children}
    </div>
  );
}
