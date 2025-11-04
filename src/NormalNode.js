import React from 'react';
import {Handle, Position} from "reactflow";

const NormalNode = ({data}) => (
    <div
        style={{
            width: 100,
            height: 50,
            background: "#90EE90",
            color: "#000",
            border: "1px solid #FFA500",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "8px",
            textAlign: "center",
        }}
    >
        {data.label}
        <Handle type="target" position={Position.Top} id="top" style={{background: "#555"}}/>
        <Handle type="target" position={Position.Right} id="right" style={{background: "#555"}}/>
        <Handle type="target" position={Position.Bottom} id="bottom" style={{background: "#555"}}/>
        <Handle type="target" position={Position.Left} id="left" style={{background: "#555"}}/>
    </div>
);
export default NormalNode;