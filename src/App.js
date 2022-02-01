import "./App.css";
import * as THREE from "three";
import cube from "./img/cube.jpg";
import { Canvas, extend, useLoader, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import { lerp } from "three/src/math/MathUtils";

const WaveShaderMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uTime: 0.0,
        uIntensity: 0.0,
    },
    glsl`
        precision mediump float;
        varying vec2 vUv;
        varying float vWavePos;
        uniform float uTime;
        uniform float uIntensity;

        #pragma glslify: snoise3 = require('glsl-noise/simplex/3d');

        void main() {
            vUv = uv;

            vec3 pos = position;
            float noiseFreq = 3.0;
            float noiseAmp = 0.5 * uIntensity;
            vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
            pos.z += snoise3(noisePos) * noiseAmp;

            vWavePos = pos.z;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    glsl`
        precision mediump float;
        varying vec2 vUv;
        varying float vWavePos;
        uniform sampler2D uTexture;
        uniform float uTime;

        void main() {
            float r = texture2D(uTexture, vUv + vWavePos * 0.1).r;
            float g = texture2D(uTexture, vUv + vWavePos * -0.05).g;
            float b = texture2D(uTexture, vUv + vWavePos * -0.05).b;

            gl_FragColor = vec4(r, g, b, 1.0);
        }
    `
);

extend({ WaveShaderMaterial });

const Wave = () => {
    const ref = useRef();
    const texture = useLoader(THREE.TextureLoader, cube);
    const [isHovered, setIsHovered] = useState(false);

    useFrame(({ clock }) => {
        ref.current.uTime = clock.getElapsedTime();
        ref.current.uIntensity = isHovered
            ? lerp(ref.current.uIntensity, 1.0, 0.1)
            : lerp(ref.current.uIntensity, 0.0, 0.1);
    });

    return (
        <mesh
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            <planeBufferGeometry args={[0.6, 0.4, 20, 20]} />
            <waveShaderMaterial ref={ref} uTexture={texture} />
        </mesh>
    );
};

const App = () => {
    return (
        <Canvas camera={{ fov: 10 }}>
            <Wave />
        </Canvas>
    );
};

export default App;
