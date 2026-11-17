# Visual parity report

```json
{
  "prototypeBaseline": "http://127.0.0.1:5174/prototype/index.html",
  "prototypeCandidate": "http://127.0.0.1:5193/parity/index.html",
  "fixtureBaseline": "http://127.0.0.1:5175/index.html",
  "fixtureCandidate": "http://127.0.0.1:5193/parity/fixture/index.html",
  "browser": "Chromium 153.0.8010.12",
  "playwright": "1.56.1",
  "viewportHeight": 900,
  "deviceScaleFactor": 1,
  "reducedMotion": "reduce",
  "fullPage": true,
  "animations": "disabled",
  "control": "second browser launch, same settings",
  "icons": "injected into candidates at run time from the frontend checkout (25 names)"
}
```

| Screen | Mode | Width | Sizes | Differing pixels | Max delta | Clusters (x0,y0–x1,y1: pixels) | Base vs base | Cand vs cand | 2nd launch |
|---|---|---|---|---|---|---|---|---|---|
| collection | light | 360 | 360×2811 | 0 | 0 |  | 0 | 0 | 0 |
| collection | light | 768 | 768×1668 | 0 | 0 |  | 0 | 0 | 0 |
| collection | light | 1024 | 1024×1617 | 0 | 0 |  | 0 | 0 | 0 |
| collection | light | 1440 | 1440×1801 | 0 | 0 |  | 0 | 0 | 0 |
| collection | dark | 360 | 360×2811 | 0 | 0 |  | 0 | 0 | 0 |
| collection | dark | 768 | 768×1668 | 0 | 0 |  | 0 | 0 | 0 |
| collection | dark | 1024 | 1024×1617 | 0 | 0 |  | 0 | 0 | 0 |
| collection | dark | 1440 | 1440×1801 | 0 | 0 |  | 0 | 0 | 0 |
| detail | light | 360 | 360×1353 | 0 | 0 |  | 0 | 0 | 0 |
| detail | light | 768 | 768×1071 | 0 | 0 |  | 0 | 0 | 0 |
| detail | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| detail | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| detail | dark | 360 | 360×1353 | 0 | 0 |  | 0 | 0 | 0 |
| detail | dark | 768 | 768×1071 | 0 | 0 |  | 0 | 0 | 0 |
| detail | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| detail | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | light | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | dark | 360 | 360×900 | 9 | 1 | 16,74–17,77: 5; 16,102–17,104: 4 | 0 | 0 | 9 |
| notFound | dark | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| notFound | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | light | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | dark | 360 | 360×900 | 9 | 1 | 16,74–17,77: 5; 16,102–17,104: 4 | 0 | 0 | 9 |
| message | dark | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| message | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| loading | light | 360 | 360×1253 | 0 | 0 |  | 0 | 0 | 0 |
| loading | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| loading | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| loading | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| loading | dark | 360 | 360×1253 | 0 | 0 |  | 0 | 0 | 0 |
| loading | dark | 768 | 768×900 | 29 | 4 | 16,229–18,246: 19; 88,246–101,246: 3; 159,246–171,246: 3; 283,246–295,246: 3; 388,246–388,246: 1 | 0 | 0 | 29 |
| loading | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| loading | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | light | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | dark | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| unavailable | dark | 768 | 768×900 | 29 | 4 | 16,229–18,246: 19; 88,246–101,246: 3; 159,246–171,246: 3; 283,246–295,246: 3; 388,246–388,246: 1 | 0 | 0 | 29 |
| unavailable | dark | 1024 | 1024×900 | 4 | 1 | 33,255–34,257: 4 | 0 | 0 | 4 |
| unavailable | dark | 1440 | 1440×900 | 4 | 1 | 33,255–34,257: 4 | 0 | 0 | 4 |
| dialog | light | 360 | 360×2811 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | light | 768 | 768×1668 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | light | 1024 | 1024×1617 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | light | 1440 | 1440×1801 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | dark | 360 | 360×2811 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | dark | 768 | 768×1668 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | dark | 1024 | 1024×1617 | 0 | 0 |  | 0 | 0 | 0 |
| dialog | dark | 1440 | 1440×1801 | 0 | 0 |  | 0 | 0 | 0 |
| form | light | 360 | 360×1409 | 0 | 0 |  | 0 | 0 | 0 |
| form | light | 768 | 768×1241 | 0 | 0 |  | 0 | 0 | 0 |
| form | light | 1024 | 1024×1227 | 0 | 0 |  | 0 | 0 | 0 |
| form | light | 1440 | 1440×1227 | 0 | 0 |  | 0 | 0 | 0 |
| form | dark | 360 | 360×1409 | 0 | 0 |  | 0 | 0 | 0 |
| form | dark | 768 | 768×1241 | 0 | 0 |  | 0 | 0 | 0 |
| form | dark | 1024 | 1024×1227 | 0 | 0 |  | 0 | 0 | 0 |
| form | dark | 1440 | 1440×1227 | 0 | 0 |  | 0 | 0 | 0 |
| components | light | 360 | 360×2427 | 0 | 0 |  | 0 | 0 | 0 |
| components | light | 768 | 768×2267 | 0 | 0 |  | 0 | 0 | 0 |
| components | light | 1024 | 1024×2267 | 0 | 0 |  | 0 | 0 | 0 |
| components | light | 1440 | 1440×2267 | 0 | 0 |  | 0 | 0 | 0 |
| components | dark | 360 | 360×2427 | 0 | 0 |  | 0 | 0 | 0 |
| components | dark | 768 | 768×2267 | 0 | 0 |  | 0 | 0 | 0 |
| components | dark | 1024 | 1024×2267 | 0 | 0 |  | 0 | 0 | 0 |
| components | dark | 1440 | 1440×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | light | 360 | 360×2427 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | light | 768 | 768×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | light | 1024 | 1024×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | light | 1440 | 1440×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | dark | 360 | 360×2427 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | dark | 768 | 768×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | dark | 1024 | 1024×2267 | 0 | 0 |  | 0 | 0 | 0 |
| confirm | dark | 1440 | 1440×2267 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 360 | 360×1324 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 768 | 768×1105 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 1024 | 1024×1142 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 1440 | 1440×1102 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 360 | 360×1324 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 768 | 768×1105 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 1024 | 1024×1142 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 1440 | 1440×1102 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
