import React from 'react';
import {Handle, Position} from "react-flow-renderer";

const NetworkNode = ({data}) => {
    return (
        <div
            style={{
                width: 80,
                height: 100,
                border: "2px solid #FFA500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                position: "relative",
                textAlign: "center",
                fontSize: "8px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                borderRadius: "6px",
                fontFamily: "monospace",
            }}
        >
            {data.label}
            <Handle type="source" position={Position.Top} id="top" style={{background: "#555"}}/>
            <Handle type="source" position={Position.Bottom} id="bottom" style={{background: "#555"}}/>
            <Handle type="source" position={Position.Left} id="left" style={{background: "#555"}}/>
            <Handle type="source" position={Position.Right} id="right" style={{background: "#555"}}/>
        </div>
    );
};

export default NetworkNode;