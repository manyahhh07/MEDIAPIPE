import { useEffect, useRef } from "react";
import * as THREE from "three";
import { HAND_CONNECTIONS, type HandPose } from "@/data/gestureLibrary";

interface SignAvatar3DProps {
  /** Sequence of hand poses to animate through, changes trigger a new playback. */
  poses: HandPose[];
  /** Seconds spent interpolating between each pose. */
  secondsPerPose?: number;
  onSequenceComplete?: () => void;
}

const JOINT_RADIUS = 0.045;
const BONE_RADIUS = 0.018;

/**
 * Renders a minimal skeletal hand (joints as spheres, bones as cylinders)
 * and animates it through a sequence of poses. This is intentionally NOT a
 * photorealistic rigged avatar - building/rigging/animating a believable
 * human character model is a real asset-creation pipeline, not something
 * generated here. This gives a real, correctly-animated stand-in that a
 * proper avatar could later replace without touching the animation logic
 * (gestureLibrary.ts / this component's interpolation) at all.
 */
export function SignAvatar3D({ poses, secondsPerPose = 0.6, onSequenceComplete }: SignAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    joints: THREE.Mesh[];
    bones: { mesh: THREE.Mesh; a: number; b: number }[];
    animationId: number;
  } | null>(null);

  // One-time scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.8, 3.2);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(2, 3, 4);
    scene.add(ambient, key);

    const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x0f9c8b });
    const boneMaterial = new THREE.MeshStandardMaterial({ color: 0x18181b });

    const joints = Array.from({ length: 21 }, () => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(JOINT_RADIUS, 16, 16), jointMaterial);
      scene.add(mesh);
      return mesh;
    });

    const bones = HAND_CONNECTIONS.map(([a, b]) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(BONE_RADIUS, BONE_RADIUS, 1, 8), boneMaterial);
      scene.add(mesh);
      return { mesh, a, b };
    });

    stateRef.current = { scene, camera, renderer, joints, bones, animationId: 0 };

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(stateRef.current?.animationId ?? 0);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []);

  // Pose playback: re-runs whenever the pose sequence changes
  useEffect(() => {
    const state = stateRef.current;
    if (!state || poses.length === 0) return;

    const applyPose = (pose: HandPose) => {
      pose.forEach(([x, y, z], i) => {
        state.joints[i]?.position.set(x, y, z);
      });
      state.bones.forEach(({ mesh, a, b }) => {
        const pa = new THREE.Vector3(...pose[a]);
        const pb = new THREE.Vector3(...pose[b]);
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const dist = pa.distanceTo(pb);
        mesh.position.copy(mid);
        mesh.scale.set(1, dist, 1);
        mesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          pb.clone().sub(pa).normalize()
        );
      });
    };

    const lerpPose = (a: HandPose, b: HandPose, t: number): HandPose =>
      a.map(([x, y, z], i) => {
        const [bx, by, bz] = b[i];
        return [x + (bx - x) * t, y + (by - y) * t, z + (bz - z) * t] as [number, number, number];
      });

    let start = performance.now();
    let segment = 0;

    const tick = (now: number) => {
      if (!stateRef.current) return;
      const t = Math.min(1, (now - start) / (secondsPerPose * 1000));
      const from = poses[segment];
      const to = poses[Math.min(segment + 1, poses.length - 1)];
      applyPose(lerpPose(from, to, t));

      state.renderer.render(state.scene, state.camera);

      if (t >= 1) {
        segment += 1;
        start = now;
        if (segment >= poses.length - 1) {
          onSequenceComplete?.();
          return; // stop after the final segment settles
        }
      }
      state.animationId = requestAnimationFrame(tick);
    };

    state.animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.animationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poses]);

  return <div ref={containerRef} className="h-full w-full" />;
}