  const W = 1024, H = 1536;
  // Continuous masks in the common source coordinate system.
  // They include the small body contact patches needed for coherent occlusion.
  const PARTS = [
    { key: 'chest', group: 'chest', source: 'master', feather: 5,
      allow: 'M 239 252 H 425 V 480 H 239 Z M 610 275 Q 669 247 730 258 Q 778 270 786 354 L 805 420 L 775 480 L 610 480 Z', path:
      'M 306 244 Q 356 234 404 257 L 435 270 Q 506 306 577 270 L 613 257 Q 682 233 736 255 Q 775 278 775 334 L 796 374 Q 813 412 793 458 L 731 480 L 679 440 L 672 511 Q 670 538 650 544 Q 664 606 624 633 Q 524 675 408 633 Q 372 607 383 548 L 366 543 L 351 449 L 313 478 L 252 457 Q 231 427 241 393 L 261 361 Q 249 321 269 283 Q 282 255 306 244 Z' },
    { key: 'groin', group: 'groin', source: 'groin', feather: 7,
      allow: 'M 400 660 H 634 V 768 L 571 851 H 453 L 400 768 Z', path:
      'M 353 622 L 677 622 L 687 757 Q 680 798 630 825 L 580 858 L 445 858 L 399 827 Q 348 798 341 756 Z' },
    {key:'pants', group:'pants', source:'full', path:'M 290 620 H 745 V 1000 H 290 Z', hide:'M 313 650 H 720 V 995 H 313 Z'},
    {key:'shins', group:'shins', source:'full', path:'M 278 990 H 738 V 1310 H 278 Z', hide:'M 295 990 H 717 V 1310 H 295 Z'},
    {key:'skates', group:'skates', source:'full', path:'M 245 1290 H 790 V 1536 H 245 Z', hide:'M 270 1300 H 765 V 1536 H 270 Z'},
    {key:'elbowL', group:'elbows', source:'full', path:'M 188 485 H 355 V 673 H 188 Z'},
    {key:'elbowR', group:'elbows', source:'full', path:'M 670 485 H 855 V 673 H 670 Z'},
    { key: 'gloveL', group: 'gloves', source: 'gloves', wristBlend: true,
      allow: 'M 125 659 H 295 V 933 H 125 Z',
      hide: 'M 158 733 L 266 733 L 272 909 L 158 917 Z', path:
      'M 155 623 L 273 623 L 290 730 L 288 862 L 250 922 L 190 929 L 133 866 L 127 777 L 137 706 Z' },
    { key: 'gloveR', group: 'gloves', source: 'gloves', wristBlend: true,
      allow: 'M 719 659 H 910 V 936 H 719 Z',
      hide: 'M 769 733 L 875 733 L 881 918 L 769 918 Z', path:
      'M 741 623 L 856 623 L 904 722 L 906 860 L 849 931 L 781 931 L 726 864 L 723 737 Z' },
    { key: 'helmet', group: 'helmet', source: 'head', headBlend: true, hide:'M 419 20 H 603 V 144 H 549 L 529 108 H 405 Z', path:
      'M 330 0 H 670 V 220 H 592 L 582 266 Q 542 280 500 268 L 479 248 L 456 244 L 413 232 H 330 Z' },
    // Only the plastic shell changes. Face, ears and cage come from the fixed head.
    { key: 'helmetPaint', group: 'helmet', source: 'helmetPaint', fillRule: 'evenodd', path:
      'M 404 98 Q 397 67 408 42 Q 422 14 478 6 Q 548 -2 585 33 Q 609 51 608 91 L 602 142 Q 598 162 582 174 L 567 174 L 562 164 Q 537 171 521 158 L 511 155 L 508 119 Q 510 109 492 108 L 444 104 L 416 104 Z M 543 121 Q 557 112 568 123 L 568 139 Q 565 156 550 158 Q 535 163 532 145 Q 532 132 543 121 Z' },
    { key: 'chin', group: 'chin', source: 'chin', path:
      'M 423 197 Q 452 191 493 199 L 507 160 L 507 110 L 525 108 L 526 159 L 507 197 L 566 161 L 577 163 L 571 183 L 510 215 Q 503 245 477 249 Q 437 253 422 232 L 416 214 Z' },
    { key: 'neck', group: 'neck', source: 'neck', feather: 1.5, path:
      'M 442 235 Q 483 262 555 237 L 560 215 Q 575 214 585 245 L 589 266 Q 637 261 655 285 Q 671 309 645 335 Q 622 365 587 384 Q 515 408 442 383 Q 397 365 373 327 Q 360 305 377 284 Q 400 269 436 267 Z' }

  ];

  const DEFAULT_URLS = {
    base: '/constructor-assets/figure/base.webp', master: '/constructor-assets/figure/master.webp',
    red: '/constructor-assets/figure/red-gloves.webp', groin: '/constructor-assets/figure/groin.webp', full: '/constructor-assets/figure/full.webp',
    helmetBare: '/constructor-assets/figure/helmet-bare.webp', chin: '/constructor-assets/figure/chin.webp',
    neckBase: '/constructor-assets/figure/neck-base.webp', neckCube: '/constructor-assets/figure/neck-cube.webp',
    helmetBlackBare: '/constructor-assets/figure/helmet-black-bare.webp', helmetBlackMask: '/constructor-assets/figure/helmet-black-mask.webp',
    helmetRedBare: '/constructor-assets/figure/helmet-red-bare.webp', helmetRedMask: '/constructor-assets/figure/helmet-red-mask.webp',
    helmetBlueBare: '/constructor-assets/figure/helmet-blue-bare.webp', helmetBlueMask: '/constructor-assets/figure/helmet-blue-mask.webp',
    glovesRedBlackL: '/constructor-assets/figure/gloves-redblack-left.webp', glovesRedBlackR: '/constructor-assets/figure/gloves-redblack-right.webp',
    glovesBlueBlackL: '/constructor-assets/figure/gloves-blueblack-left.webp', glovesBlueBlackR: '/constructor-assets/figure/gloves-blueblack-right.webp',
    glovesCubeL: '/constructor-assets/figure/gloves-cube-left.webp', glovesCubeR: '/constructor-assets/figure/gloves-cube-right.webp'
  };

  export const HELMET_SOURCES = {
    black:{bare:'helmetBlackBare',mask:'helmetBlackMask'},
    red:{bare:'helmetRedBare',mask:'helmetRedMask'},
    blue:{bare:'helmetBlueBare',mask:'helmetBlueMask'},
  };
  export const GLOVE_SOURCES = {
    redblack:{left:'glovesRedBlackL',right:'glovesRedBlackR'},
    blueblack:{left:'glovesBlueBlackL',right:'glovesBlueBlackR'},
    cube:{left:'glovesCubeL',right:'glovesCubeR'},
  };
  // Cropped exports keep the common 1024×1536 coordinates with a small download.
  export const SOURCE_FRAMES = Object.fromEntries([
    ...Object.values(HELMET_SOURCES).flatMap(pair=>Object.values(pair).map(key=>[key,{x:380,y:0,width:245,height:195}])),
    ...Object.values(GLOVE_SOURCES).flatMap(pair=>[
      [pair.left,{x:120,y:620,width:185,height:320}],
      [pair.right,{x:710,y:620,width:210,height:320}],
    ]),
  ]);

  export const COLOUR_ASSET_URLS = Object.keys(SOURCE_FRAMES).map(key=>DEFAULT_URLS[key]);

  function createScene(options = {}) {
    const prefix = options.prefix || 'fit';
    const on = options.on || { helmet: true, chest: true, gloves: true, groin: true };
    const colour = options.gloveColour || options.colour || 'black';
    const helmetColour = options.helmetColour || 'white';
    const urls = { ...DEFAULT_URLS, ...options.urls };
    const active = PARTS.filter(p => (p.group === 'skates' || on[p.group]) && !(p.group === 'groin' && on.pants) && !(p.group === 'chin' && (!on.helmet || on.mask)) && !(p.source === 'helmetPaint' && !HELMET_SOURCES[helmetColour])).map(p => {
      if(p.source === 'gloves' && options.gloveLine === 'cube') return {...p,allow:null,silhouetteSource:'master'};
      if(p.group === 'neck' && on.chest) return {...p,path:'M 442 235 Q 483 262 555 237 L 560 215 Q 575 214 585 245 L 589 282 Q 580 305 515 305 Q 465 304 436 282 Z'};
      if(p.key === 'helmet') return {...p,allow:on.mask
        ? 'M 407 79 Q 397 42 431 19 Q 481 -1 542 8 Q 612 29 608 89 L 602 168 L 578 210 L 576 277 Q 514 313 437 279 L 399 237 Q 377 197 380 132 L 385 97 Z'
        : 'M 407 79 Q 397 42 431 19 Q 481 -1 542 8 Q 612 29 608 89 L 602 168 L 578 210 L 578 251 Q 517 300 439 256 L 405 231 L 402 190 L 413 145 L 409 107 Z'};
      return p;
    });
    const defs = active.map(p => {
      const filter = p.feather ? `<filter id="${prefix}-${p.key}-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${p.feather}"/></filter>` : '';
      const gradient = p.wristBlend ? `<linearGradient id="${prefix}-${p.key}-wrist" gradientUnits="userSpaceOnUse" x1="0" y1="623" x2="0" y2="660"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>` : '';
      const headGradient = p.headBlend ? `<linearGradient id="${prefix}-${p.key}-contact" gradientUnits="userSpaceOnUse" x1="0" y1="225" x2="0" y2="270"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>` : '';
      const headSolid = p.headBlend ? '<path d="M 330 0 H 670 V 210 H 590 L 568 225 L 513 240 L 486 247 L 439 241 L 412 230 H 330 Z" fill="white"/>' : '';
      const fill = p.headBlend ? `url(#${prefix}-${p.key}-contact)` : p.wristBlend ? `url(#${prefix}-${p.key}-wrist)` : 'white';
      const filterAttribute = p.feather ? ` filter="url(#${prefix}-${p.key}-blur)"` : '';
      const silhouette = (p.allow || p.silhouetteSource) ? `<mask id="${prefix}-${p.key}-silhouette" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${urls[p.silhouetteSource || 'base']}" width="${W}" height="${H}"/>${p.allow ? `<path d="${p.allow}" fill="white"/>` : ''}</mask>` : '';
      return `${filter}${gradient}${headGradient}${silhouette}<mask id="${prefix}-${p.key}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:luminance"><path d="${p.path}" fill="${fill}" fill-rule="${p.fillRule || 'nonzero'}"${filterAttribute}/>${headSolid}</mask>`;
    }).join('');
    // Only clear anatomy that would protrude. Keep the base behind contact patches
    // so antialiased/feathered seams cannot punch holes in clothing or legs.
    const hidden = active.filter(p => p.hide || p.key === 'helmet').map(p => `<path d="${p.hide || p.path}" fill="black"/>`).join('');
    const layers = active.map(p => {
      // A mask already includes its photographed chin cup. The separate chin accessory
      // has its own small layer; it never draws a second cup over the cage.
      let sourceKey = p.source;
      if(p.source === 'head') sourceKey = on.mask ? 'master' : 'helmetBare';
      else if(p.source === 'helmetPaint') sourceKey = HELMET_SOURCES[helmetColour][on.mask?'mask':'bare'];
      else if(p.source === 'neck') sourceKey = options.neckLine === 'cube' ? 'neckCube' : 'neckBase';
      else if(p.source === 'gloves') {
        const pair = options.gloveLine === 'cube' ? GLOVE_SOURCES.cube : GLOVE_SOURCES[colour];
        sourceKey = pair ? pair[p.key === 'gloveL' ? 'left' : 'right'] : colour === 'red' ? 'red' : 'master';
      }
      const src = urls[sourceKey];
      const frame = SOURCE_FRAMES[sourceKey] || {x:0,y:0,width:W,height:H};
      const image = `<image href="${src}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" preserveAspectRatio="none" mask="url(#${prefix}-${p.key})"/>`;
      return (p.allow || p.silhouetteSource) ? `<g mask="url(#${prefix}-${p.key}-silhouette)">${image}</g>` : image;
    }).join('');
    // Коньки упираются в лёд на y≈1472 (ниже прозрачно) — измерено по альфе base.webp.
    // Тень рисуется до фигуры, поэтому видно только то, что выходит за лезвия.
    const groundDefs = `<radialGradient id="${prefix}-ground-wide"><stop offset="0" stop-color="#0e1c2c" stop-opacity=".34"/><stop offset=".7" stop-color="#0e1c2c" stop-opacity=".2"/><stop offset="1" stop-color="#0e1c2c" stop-opacity="0"/></radialGradient><radialGradient id="${prefix}-ground-blade"><stop offset="0" stop-color="#0b1724" stop-opacity=".62"/><stop offset=".72" stop-color="#0b1724" stop-opacity=".38"/><stop offset="1" stop-color="#0b1724" stop-opacity="0"/></radialGradient>`;
    const ground = `<ellipse cx="514" cy="1488" rx="340" ry="46" fill="url(#${prefix}-ground-wide)"/><ellipse cx="323" cy="1482" rx="104" ry="22" fill="url(#${prefix}-ground-blade)"/><ellipse cx="705" cy="1480" rx="104" ry="22" fill="url(#${prefix}-ground-blade)"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Хоккеист с выбранной экипировкой"><defs>${defs}<mask id="${prefix}-body" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:luminance"><rect width="${W}" height="${H}" fill="white"/>${hidden}</mask>${groundDefs}</defs>${ground}<image href="${urls.base}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" mask="url(#${prefix}-body)"/>${layers}</svg>`;
  }


export { W, H, PARTS, DEFAULT_URLS, createScene };
