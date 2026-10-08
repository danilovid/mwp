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
    { key: 'helmet', group: 'helmet', source: 'master', path:
      'M 330 0 L 670 0 L 670 237 L 590 237 L 576 277 Q 514 313 437 279 L 415 237 L 330 237 Z' }
  ];

  const DEFAULT_URLS = {
    base: '/constructor-assets/figure/base.webp', master: '/constructor-assets/figure/master.webp',
    red: '/constructor-assets/figure/red-gloves.webp', groin: '/constructor-assets/figure/groin.webp', full: '/constructor-assets/figure/full.webp'
  };

  function createScene(options = {}) {
    const prefix = options.prefix || 'fit';
    const on = options.on || { helmet: true, chest: true, gloves: true, groin: true };
    const colour = options.colour || 'black';
    const urls = { ...DEFAULT_URLS, ...options.urls };
    const active = PARTS.filter(p => (p.group === 'skates' || on[p.group]) && !(p.group === 'groin' && on.pants));
    const defs = active.map(p => {
      const filter = p.feather ? `<filter id="${prefix}-${p.key}-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${p.feather}"/></filter>` : '';
      const gradient = p.wristBlend ? `<linearGradient id="${prefix}-${p.key}-wrist" gradientUnits="userSpaceOnUse" x1="0" y1="623" x2="0" y2="660"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>` : '';
      const fill = p.wristBlend ? `url(#${prefix}-${p.key}-wrist)` : 'white';
      const filterAttribute = p.feather ? ` filter="url(#${prefix}-${p.key}-blur)"` : '';
      const silhouette = p.allow ? `<mask id="${prefix}-${p.key}-silhouette" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${urls.base}" width="${W}" height="${H}"/><path d="${p.allow}" fill="white"/></mask>` : '';
      return `${filter}${gradient}${silhouette}<mask id="${prefix}-${p.key}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:luminance"><path d="${p.path}" fill="${fill}"${filterAttribute}/></mask>`;
    }).join('');
    // Only clear anatomy that would protrude. Keep the base behind contact patches
    // so antialiased/feathered seams cannot punch holes in clothing or legs.
    const hidden = active.filter(p => p.hide || p.group === 'helmet').map(p => `<path d="${p.hide || p.path}" fill="black"/>`).join('');
    const layers = active.map(p => {
      const src = p.source === 'gloves' ? (colour === 'red' ? urls.red : urls.master) : urls[p.source];
      const image = `<image href="${src}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" mask="url(#${prefix}-${p.key})"/>`;
      return p.allow ? `<g mask="url(#${prefix}-${p.key}-silhouette)">${image}</g>` : image;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Хоккеист с выбранной экипировкой"><defs>${defs}<mask id="${prefix}-body" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:luminance"><rect width="${W}" height="${H}" fill="white"/>${hidden}</mask></defs><image href="${urls.base}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" mask="url(#${prefix}-body)"/>${layers}</svg>`;
  }


export { W, H, PARTS, DEFAULT_URLS, createScene };
