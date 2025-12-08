(function(){
  // Global tuning for snow flow and cursor wind prominence
  window.SNOW_TUNING = {
    flow: {
      scale: 1.8,         // multiplier on sampled flow velocity
      splatForce: 7.5,    // how strong a cursor injection is
      splatRadius: 160,   // px radius around cursor for flow splat
      diffusion: 0.20,    // how quickly velocity diffuses across cells
      dissipation: 0.970, // how quickly the field loses energy
      curl: 0.45          // rotational component for lively swirl
    },
    puff: {
      coef: 0.26,         // vx/vy = dx * coef for wind puffs
      radiusBoost: 60,    // extra radius added to base puff radius
      life: 1200          // ms lifetime of a puff
    },
    breeze: {
      factor: 0.35,       // relative to gust strength
      extraDuration: 2000 // ms added after gust for lingering breeze
    }
  };
})();
