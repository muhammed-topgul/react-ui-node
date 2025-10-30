import React, {useCallback, useState} from "react";
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    Handle,
    Position,
} from "react-flow-renderer";
import "react-flow-renderer/dist/style.css";

// Network node'u özel bileşen olarak
const NetworkNode = ({data}) => {
    return (
        <div
            style={{
                width: 80,
                height: 100,
                // background: "#FFD700",
                // color: "#000",
                border: "2px solid #FFA500",
                // borderRadius: 10,
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

const NormalNode = ({ data }) => (
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
        {/* Sadece bir handle: top */}
        {/*<Handle type="source" position={Position.Top} id="a" style={{ background: "#555" }} />*/}
        <Handle type="target" position={Position.Bottom} id="b" style={{ background: "#555" }} />
    </div>
);

const nodeTypes = {
    networkNode: NetworkNode,
    normalNode: NormalNode,
};

const initialNodes = [
    {
        id: "1",
        type: "networkNode", // özel node tipi
        data: {label: "Network"},
        position: {x: 250, y: -150},
    },
    {
        id: "2",
        data: {label: "Node-1"},
        position: {x: 100, y: 100},
        style: {
            width: 100,
            height: 50,
            background: "#90EE90",
            color: "#000",
            border: "1px solid #FFA500",
            borderRadius: 10,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "8px",
        },
        type: "normalNode",
    },
    {
        id: "3",
        data: {label: "Node-2"},
        position: {x: 400, y: 200},
        style: {
            width: 100,
            height: 50,
            background: "#90EE90",
            color: "#000",
            border: "1px solid #FFA500",
            borderRadius: 10,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "8px",
        },
        type: "normalNode",
    },
];

const initialEdges = [
    {
        id: "e1-2",
        source: "1",
        sourceHandle: "bottom", // hangi handle'dan çıkıyor
        target: "2",
        animated: true,
        type: "smoothstep",
        label: "↔",
        style: {strokeWidth: 1},
    },
];

function FlowCanvas() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [mousePos, setMousePos] = useState({x: 0, y: 0});
    const {project} = useReactFlow();

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    // const onConnect = useCallback((params) => setEdges((eds) =>
    //         eds.concat({...params, animated: true, label: "java", type: "smoothstep"})
    //     ),
    //     []
    // );

    const onConnect = useCallback(
        (params) => {
            // Sadece Network node'u ile bağlantıya izin ver
            const networkId = "1"; // Network node'un ID'si
            if (params.source === networkId || params.target === networkId) {
                setEdges((eds) =>
                    eds.concat({ ...params, animated: true, type: "smoothstep", label:"Java" })
                );
            }
        },
        []
    );

    const handleMouseMove = useCallback(
        (event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const position = project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });
            setMousePos({x: Math.round(position.x), y: Math.round(position.y)});
        },
        [project]
    );

    const handleContextMenu = useCallback(
        (event) => {
            event.preventDefault();
            const bounds = event.currentTarget.getBoundingClientRect();
            const position = project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });

            const id = (nodes.length + 1).toString();
            const newNode = {
                id,
                data: {label: `Düğüm ${id}`},
                position,
                style: {
                    width: 100,
                    height: 50,
                    background: "#90EE90",
                    color: "#000",
                    border: "1px solid #FFA500",
                    borderRadius: 10,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "8px",
                },
            };
            setNodes((nds) => nds.concat(newNode));
        },
        [nodes.length, project]
    );

    return (
        <div style={{height: "100vh", position: "relative"}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onMouseMove={handleMouseMove}
                onContextMenu={handleContextMenu}
                fitView
            >
                <MiniMap/>
                <Controls/>
                <Background gap={8}/>
            </ReactFlow>

            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    padding: "6px 10px",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                }}
            >
                🖱 x: {mousePos.x}, y: {mousePos.y}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <FlowCanvas/>
        </ReactFlowProvider>
    );
}
