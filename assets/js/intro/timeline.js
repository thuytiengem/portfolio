// ============================================================================
//  INTRO TIMELINE — edit this file to re-order, re-time or remove intro steps.
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
  { step: "noise", dur: 260, amount: 1.2 },                        // 0.00s digital block noise
  { wait: 120, step: "showArt" },                                  // 0.12s hero image glitches in
  { step: "hudIn" },                                               //       reticle opens over it
  { wait: 200, step: "shake", dur: 1000, maxPx: 11, dust: 1 },    // 0.32s organic shake + falling dust
  { wait: 860, step: "cracks" },                                   // 1.18s cracks spread
  { wait: 150, step: "shatter", chips: 170, sparks: 90 },          // 1.33s break: shards + debris + flash
  { step: "warp", dur: 520 },                                      //       light-speed streaks
  { step: "hudOut" },                                              //       reticle blows out
  { wait: 180, step: "noise", dur: 420, amount: 0.8 },             // 1.51s
  { step: "titleIn" },                                             //       PORTFOLIO glitches in (striped)
  { wait: 420, step: "titleClean" },                               // 1.93s clean title
  { step: "typeBrand", speed: 32, await: true },                   //       THUYTIENGEM typed
  { step: "quoteOpen" },                                           //       quote bar opens
  { wait: 220, step: "typeQuote", speed: 12, await: true },        //       quote typed
  { step: "reveal" },                                              //       topbar slides in, page unlocks
];
