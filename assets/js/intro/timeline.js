// ============================================================================
//  INTRO TIMELINE — edit this file to re-order, re-time or remove intro steps.
//  ("Power Surge": circuit lines power on, the glass fades in behind, energy overloads,
//   white-out and the glass explodes in 3D; a few small pieces stop mid-air.)
//
//  Steps run top to bottom:
//    wait  : ms to wait BEFORE the step starts
//    step  : name of a step defined in ./steps.js
//    await : true → the next step waits until this one has finished
//    other keys are options passed to the step
//
//  Set INTRO_ENABLED = false to skip the intro entirely (page opens on the final state).
// ============================================================================

export const INTRO_ENABLED = true;

export const TIMELINE = [
  { step: "powerOn" },                                             // 0.00s circuit lines flicker on in the dark
  { wait: 450, step: "glassIn" },                                  // 0.45s glass fades in behind the lines
  { wait: 350, step: "overload", dur: 1000, await: true },         // 0.80s glitch slices, brighter and brighter, shake
  { step: "explode", particles: 24, settle: 1300 },                // 1.80s white-out + 3D explosion; shards tremble once settled
  { wait: 450, step: "titleIn" },                                  // 2.25s PORTFOLIO glitches in (striped)
  { wait: 420, step: "titleClean" },                               // 2.67s clean title
  { step: "brandIn" },                                             //       THUYTIENGEM fades in
  { wait: 250, step: "quoteIn" },                                  // 2.92s quote bar fades in
  { wait: 500, step: "reveal" },                                   // 3.42s topbar fades in, page unlocks
];
