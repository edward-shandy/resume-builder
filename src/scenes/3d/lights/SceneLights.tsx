/**
 * Cool moonlight rig: a dim blue-violet ambient fill plus a soft white
 * "moonlight" key light, with a faint warm rim so gold accents (the
 * shooting stars, the CTA nebula) catch a little glow without turning
 * the whole scene warm. Everything else in this scene is emissive/
 * additive (stars, meteors, nebula), so this rig only really lights
 * the moon and constellation markers.
 */
export function SceneLights() {
  return (
    <>
      <ambientLight color="#2a3466" intensity={0.5} />

      <directionalLight color="#dfe6ff" intensity={0.9} position={[3, 6, 4]} />

      {/* Cool rim from below/behind — keeps the void from going flat black */}
      <pointLight color="#4a5bb8" intensity={8} distance={16} position={[-4, -1, -3]} />

      {/* Faint warm accent — picks out gold highlights sparingly */}
      <pointLight color="#ffd98e" intensity={4} distance={14} position={[2, 2, 3]} />
    </>
  )
}
