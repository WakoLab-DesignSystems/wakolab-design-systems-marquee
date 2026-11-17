# Motion

- Duration: 180 ms (`--wl-motion`, from `--wl-dur-slow`), ease-out.
- **Hover lift:** a tile rises by 3 px (`--wl-hover-lift`) and its shadow moves from `shadow-card` to `shadow-pop`.
- Dialogs and toasts rise into place (opacity and a small translation). Skeletons shimmer while loading.
- **Reduced motion:** inside the Marquee root, animations and transitions are removed (and durations reduced to 0.01 ms), skeleton shimmer is hidden, and **a hovered tile does not move** (its shadow still changes, without transition). The host page is not affected.
