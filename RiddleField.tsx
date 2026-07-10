import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// "All we need is love" sticker, kept as its native SVG markup (vector
// paths + gradients) instead of a base64-encoded PNG. This is what
// keeps the file small and the Framer code editor responsive — the
// full-size PNG version was ~330,000 characters; this SVG is a small
// fraction of that. It's rasterized to a PNG on the fly at download
// time (see downloadSvgAsPng below), so the person still gets a plain
// .png file, matching the previous behaviour exactly.
const STICKER_SVG = `<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="5" y="5" width="289.922" height="289.922" rx="144.961" fill="url(#paint0_radial_15_1981)"/>
<rect x="7" y="7" width="285.922" height="285.922" rx="142.961" stroke="url(#paint1_linear_15_1981)" stroke-opacity="0.1" stroke-width="4"/>
<path d="M173.916 270.078L175.918 281.456L169.05 282.664L168.835 281.442L174.325 280.477L173.648 276.632L168.515 277.535L168.3 276.312L173.434 275.409L172.753 271.542L167.175 272.523L166.96 271.301L173.916 270.078Z" fill="url(#paint2_linear_15_1981)"/>
<path d="M189.99 277.725L184.069 269.281L183.939 269.317L183.253 279.607L181.84 280.002L182.816 267.733L184.207 267.344L191.403 277.33L189.99 277.725Z" fill="url(#paint3_linear_15_1981)"/>
<path d="M194.186 270.081C193.724 268.953 193.528 267.895 193.598 266.907C193.668 265.919 193.967 265.057 194.494 264.32C195.021 263.584 195.741 263.028 196.652 262.654C197.564 262.281 198.466 262.171 199.359 262.325C200.251 262.479 201.069 262.883 201.813 263.538C202.557 264.192 203.16 265.083 203.623 266.21C204.085 267.338 204.281 268.395 204.211 269.383C204.141 270.372 203.842 271.234 203.315 271.971C202.787 272.707 202.068 273.262 201.156 273.636C200.245 274.01 199.343 274.12 198.45 273.966C197.558 273.811 196.739 273.407 195.995 272.753C195.252 272.099 194.648 271.208 194.186 270.081ZM195.439 269.567C195.818 270.492 196.294 271.21 196.864 271.72C197.432 272.231 198.045 272.542 198.705 272.654C199.361 272.767 200.013 272.691 200.66 272.425C201.307 272.16 201.826 271.756 202.217 271.213C202.605 270.672 202.823 270.02 202.872 269.256C202.917 268.493 202.75 267.649 202.37 266.724C201.99 265.798 201.517 265.08 200.95 264.569C200.379 264.059 199.765 263.748 199.109 263.635C198.45 263.523 197.796 263.6 197.149 263.865C196.502 264.131 195.984 264.534 195.596 265.075C195.205 265.618 194.987 266.27 194.942 267.033C194.893 267.797 195.059 268.641 195.439 269.567Z" fill="url(#paint4_linear_15_1981)"/>
<path d="M211.309 255.583L216.853 265.72L215.625 266.391L210.677 257.344L205.965 259.92L205.37 258.831L211.309 255.583Z" fill="url(#paint5_linear_15_1981)"/>
<path d="M228.66 254.061C229.066 254.469 229.556 254.648 230.13 254.599C230.704 254.549 231.265 254.309 231.815 253.876C232.217 253.56 232.518 253.218 232.717 252.851C232.914 252.486 233.006 252.124 232.996 251.764C232.982 251.406 232.862 251.082 232.634 250.792C232.443 250.55 232.222 250.387 231.969 250.303C231.716 250.225 231.453 250.2 231.179 250.229C230.907 250.26 230.642 250.318 230.383 250.403C230.126 250.49 229.896 250.577 229.692 250.666L228.575 251.143C228.289 251.266 227.959 251.388 227.583 251.506C227.204 251.627 226.808 251.697 226.393 251.717C225.977 251.743 225.567 251.678 225.163 251.522C224.758 251.367 224.388 251.076 224.054 250.65C223.668 250.16 223.447 249.615 223.393 249.017C223.336 248.421 223.461 247.813 223.768 247.193C224.072 246.576 224.573 245.993 225.27 245.445C225.921 244.933 226.567 244.595 227.208 244.431C227.846 244.269 228.448 244.268 229.016 244.43C229.58 244.594 230.075 244.91 230.501 245.379L229.366 246.272C229.067 245.952 228.728 245.759 228.35 245.692C227.972 245.631 227.585 245.668 227.188 245.802C226.791 245.942 226.412 246.154 226.052 246.438C225.632 246.768 225.308 247.132 225.081 247.531C224.856 247.933 224.743 248.333 224.741 248.732C224.741 249.134 224.871 249.5 225.132 249.831C225.369 250.133 225.646 250.312 225.963 250.368C226.281 250.425 226.623 250.404 226.991 250.306C227.359 250.209 227.738 250.078 228.127 249.916L229.495 249.356C230.365 249.002 231.156 248.852 231.867 248.905C232.579 248.958 233.175 249.29 233.656 249.902C234.056 250.411 234.268 250.962 234.29 251.557C234.312 252.157 234.172 252.745 233.87 253.322C233.568 253.905 233.126 254.424 232.547 254.88C231.962 255.34 231.359 255.644 230.739 255.792C230.121 255.943 229.537 255.943 228.987 255.792C228.434 255.643 227.97 255.345 227.595 254.898L228.66 254.061Z" fill="url(#paint6_linear_15_1981)"/>
<path d="M240.589 247.826L232.726 239.361L233.751 238.409L241.614 246.874L240.589 247.826Z" fill="url(#paint7_linear_15_1981)"/>
<path d="M245.965 224.331L248.168 221.528L257.251 228.669L254.949 231.596C254.257 232.477 253.482 233.088 252.626 233.429C251.772 233.772 250.876 233.845 249.936 233.646C248.999 233.45 248.061 232.983 247.12 232.244C246.174 231.5 245.492 230.691 245.074 229.817C244.659 228.945 244.522 228.043 244.662 227.11C244.805 226.18 245.239 225.253 245.965 224.331ZM248.279 223.395L246.996 225.027C246.406 225.778 246.061 226.514 245.963 227.236C245.864 227.957 245.987 228.65 246.332 229.313C246.676 229.976 247.218 230.598 247.957 231.179C248.69 231.756 249.416 232.132 250.133 232.309C250.854 232.488 251.543 232.451 252.201 232.198C252.862 231.948 253.472 231.467 254.03 230.758L255.41 229.002L248.279 223.395Z" fill="url(#paint8_linear_15_1981)"/>
<path d="M254.972 210.855L264.79 216.946L261.114 222.871L260.059 222.217L262.998 217.481L259.68 215.423L256.932 219.852L255.878 219.198L258.626 214.768L255.289 212.698L252.303 217.511L251.249 216.857L254.972 210.855Z" fill="url(#paint9_linear_15_1981)"/>
<path d="M260.604 199.518L271.011 204.537L267.982 210.818L266.864 210.278L269.285 205.258L265.769 203.562L263.504 208.257L262.387 207.718L264.651 203.023L261.114 201.317L258.654 206.419L257.536 205.88L260.604 199.518Z" fill="url(#paint10_linear_15_1981)"/>
<path d="M273.623 197.707L262.701 193.941L263.142 192.661L273.77 189.666L273.807 189.559L265.231 186.602L265.687 185.28L276.61 189.046L276.168 190.326L265.511 193.335L265.475 193.441L274.072 196.406L273.623 197.707Z" fill="url(#paint11_linear_15_1981)"/>
<path d="M269.718 165.405L281.132 167.195L280.052 174.083L278.826 173.891L279.689 168.385L275.832 167.78L275.025 172.93L273.799 172.737L274.606 167.588L270.727 166.979L269.85 172.575L268.624 172.382L269.718 165.405Z" fill="url(#paint12_linear_15_1981)"/>
<path d="M270.338 149.285L281.974 146.443L281.935 147.864L272.463 150.02L272.459 150.133L281.798 152.849L281.755 154.428L272.282 156.629L272.279 156.742L281.619 159.413L281.58 160.834L270.117 157.36L270.157 155.917L279.43 153.62L279.432 153.529L270.299 150.729L270.338 149.285Z" fill="url(#paint13_linear_15_1981)"/>
<path d="M268.138 127.595L279.546 125.766L279.767 127.148L269.585 128.78L270.435 134.083L269.21 134.28L268.138 127.595Z" fill="url(#paint14_linear_15_1981)"/>
<path d="M265.166 115.865L276.332 112.898L276.691 114.25L266.725 116.898L268.104 122.089L266.905 122.408L265.166 115.865Z" fill="url(#paint15_linear_15_1981)"/>
<path d="M260.468 103.292L259.939 101.924L272.245 101.714L272.766 103.061L263.52 111.185L262.991 109.817L270.817 103.089L270.785 103.005L260.468 103.292ZM264.873 102.17L267.005 107.684L265.847 108.132L263.715 102.617L264.873 102.17Z" fill="url(#paint16_linear_15_1981)"/>
<path d="M241.434 72.8321L250.51 65.6825L254.825 71.1598L253.85 71.9278L250.401 67.5495L247.334 69.9653L250.56 74.06L249.585 74.828L246.359 70.7333L243.275 73.1631L246.78 77.6123L245.805 78.3803L241.434 72.8321Z" fill="url(#paint17_linear_15_1981)"/>
<path d="M240.416 55.0531L235.861 64.3055L235.956 64.4022L245.307 60.0544L246.333 61.103L235.107 66.1481L234.097 65.1156L239.391 54.0045L240.416 55.0531Z" fill="url(#paint18_linear_15_1981)"/>
<path d="M231.66 55.0459C230.899 55.9976 230.069 56.6827 229.171 57.1012C228.273 57.5197 227.374 57.6773 226.475 57.5742C225.575 57.4711 224.74 57.1119 223.97 56.4966C223.201 55.8813 222.667 55.1461 222.368 54.291C222.069 53.4359 222.025 52.5243 222.236 51.5563C222.446 50.5883 222.932 49.6284 223.693 48.6766C224.454 47.7249 225.283 47.0398 226.181 46.6213C227.079 46.2028 227.978 46.0451 228.878 46.1482C229.778 46.2513 230.613 46.6105 231.382 47.2259C232.152 47.8412 232.686 48.5764 232.985 49.4315C233.283 50.2866 233.327 51.1982 233.117 52.1662C232.906 53.1342 232.42 54.0941 231.66 55.0459ZM230.602 54.2004C231.227 53.419 231.623 52.655 231.792 51.9084C231.963 51.1642 231.937 50.4767 231.714 49.846C231.495 49.2176 231.111 48.6849 230.565 48.2481C230.019 47.8113 229.413 47.5536 228.749 47.4751C228.088 47.399 227.411 47.5251 226.72 47.8537C226.032 48.1846 225.375 48.7407 224.751 49.5221C224.126 50.3035 223.728 51.0663 223.557 51.8105C223.388 52.5571 223.414 53.2446 223.634 53.873C223.857 54.5037 224.241 55.0375 224.788 55.4744C225.334 55.9112 225.938 56.1677 226.599 56.2438C227.264 56.3223 227.94 56.1961 228.628 55.8653C229.319 55.5367 229.977 54.9818 230.602 54.2004Z" fill="url(#paint19_linear_15_1981)"/>
<path d="M210.699 47.0789L216.914 37.3395L218.093 38.0921L212.546 46.7853L217.073 49.6744L216.405 50.7206L210.699 47.0789Z" fill="url(#paint20_linear_15_1981)"/>
<path d="M201.027 32.568C201.189 32.0154 201.109 31.4996 200.79 31.0206C200.47 30.5415 199.989 30.1653 199.345 29.8917C198.874 29.6917 198.43 29.5928 198.012 29.5951C197.598 29.5988 197.235 29.692 196.925 29.8747C196.618 30.0589 196.392 30.3206 196.248 30.6598C196.127 30.9436 196.091 31.2163 196.139 31.4779C196.193 31.7375 196.298 31.9804 196.455 32.2066C196.614 32.4293 196.792 32.634 196.991 32.8205C197.191 33.0036 197.379 33.163 197.554 33.2988L198.51 34.0484C198.756 34.2388 199.022 34.47 199.307 34.7423C199.595 35.0159 199.848 35.3297 200.065 35.6836C200.287 36.0355 200.428 36.4262 200.487 36.8557C200.545 37.2851 200.469 37.7491 200.257 38.2475C200.013 38.8221 199.641 39.2773 199.143 39.6132C198.648 39.9506 198.056 40.1339 197.365 40.1632C196.678 40.1939 195.925 40.0358 195.109 39.6887C194.347 39.3651 193.74 38.962 193.287 38.4795C192.838 37.9984 192.547 37.4704 192.415 36.8955C192.287 36.322 192.326 35.7357 192.531 35.1366L193.861 35.7013C193.725 36.1176 193.718 36.5072 193.842 36.8703C193.971 37.2314 194.189 37.5532 194.498 37.8357C194.812 38.1162 195.18 38.3462 195.603 38.5256C196.094 38.7345 196.569 38.8424 197.028 38.8494C197.488 38.8529 197.894 38.7595 198.244 38.5693C198.596 38.3756 198.855 38.0849 199.02 37.6973C199.17 37.3442 199.193 37.015 199.09 36.7096C198.987 36.4043 198.803 36.114 198.54 35.8387C198.277 35.5635 197.981 35.2945 197.651 35.0318L196.502 34.102C195.772 33.5102 195.26 32.8898 194.963 32.2408C194.667 31.5919 194.671 30.9091 194.975 30.1926C195.228 29.5973 195.61 29.1464 196.12 28.8402C196.635 28.5319 197.219 28.3711 197.87 28.3577C198.526 28.3423 199.193 28.4788 199.872 28.7671C200.557 29.0583 201.114 29.44 201.543 29.9123C201.973 30.3811 202.254 30.8928 202.386 31.4475C202.522 32.0036 202.484 32.5536 202.273 33.0975L201.027 32.568Z" fill="url(#paint21_linear_15_1981)"/>
<path d="M189.73 25.1224L186.176 36.116L184.845 35.6857L188.399 24.6921L189.73 25.1224Z" fill="url(#paint22_linear_15_1981)"/>
<path d="M166.62 31.7859L163.101 31.208L164.974 19.8072L168.648 20.4108C169.754 20.5925 170.663 20.9762 171.375 21.5619C172.087 22.1439 172.583 22.8943 172.863 23.813C173.144 24.7281 173.187 25.7757 172.993 26.9558C172.798 28.1434 172.418 29.1311 171.854 29.9189C171.291 30.7029 170.567 31.2586 169.683 31.5859C168.798 31.9095 167.778 31.9761 166.62 31.7859ZM164.683 30.2101L166.732 30.5466C167.674 30.7015 168.485 30.6479 169.165 30.3861C169.845 30.1242 170.392 29.6824 170.806 29.0606C171.221 28.4389 171.504 27.6642 171.657 26.7364C171.808 25.816 171.788 24.999 171.596 24.2853C171.406 23.5679 171.041 22.982 170.502 22.5275C169.963 22.0694 169.249 21.7672 168.358 21.6208L166.154 21.2587L164.683 30.2101Z" fill="url(#paint23_linear_15_1981)"/>
<path d="M150.466 30.4406L151.02 18.9004L157.985 19.2348L157.926 20.4745L152.358 20.2072L152.171 24.1065L157.378 24.3565L157.318 25.5962L152.112 25.3462L151.923 29.2681L157.581 29.5397L157.521 30.7794L150.466 30.4406Z" fill="url(#paint24_linear_15_1981)"/>
<path d="M137.819 30.9938L137.183 19.4577L144.145 19.074L144.213 20.3132L138.648 20.6199L138.863 24.5179L144.068 24.231L144.136 25.4702L138.931 25.7571L139.147 29.6775L144.803 29.3658L144.871 30.605L137.819 30.9938Z" fill="url(#paint25_linear_15_1981)"/>
<path d="M129.961 20.4595L131.922 31.8455L130.587 32.0753L122.844 24.2037L122.732 24.2229L124.272 33.1627L122.893 33.4001L120.932 22.0141L122.267 21.7843L130.036 29.6743L130.148 29.6551L128.605 20.6931L129.961 20.4595Z" fill="url(#paint26_linear_15_1981)"/>
<path d="M103.535 39.4423L99.6048 28.5777L106.162 26.2059L106.584 27.373L101.343 29.2689L102.67 32.94L107.572 31.1669L107.994 32.334L103.093 34.1071L104.428 37.7993L109.754 35.8728L110.177 37.0399L103.535 39.4423Z" fill="url(#paint27_linear_15_1981)"/>
<path d="M89.1246 46.6899L81.0113 37.8786L82.274 37.2256L88.7411 44.4748L88.8414 44.4229L86.7037 34.9348L88.1068 34.2092L94.614 41.4377L94.7142 41.3858L92.5365 31.9184L93.7993 31.2654L96.3003 42.979L95.0175 43.6424L88.5234 36.6358L88.4432 36.6773L90.4074 46.0265L89.1246 46.6899Z" fill="url(#paint28_linear_15_1981)"/>
<path d="M71.2239 59.1299L64.0955 50.0376L65.1965 49.1744L71.5592 57.29L75.7857 53.9764L76.5515 54.9531L71.2239 59.1299Z" fill="url(#paint29_linear_15_1981)"/>
<path d="M62.3935 67.4023L54.3986 59.0617L55.4086 58.0936L62.5447 65.5382L66.4217 61.8218L67.2806 62.7178L62.3935 67.4023Z" fill="url(#paint30_linear_15_1981)"/>
<path d="M53.6146 77.5577L52.6675 78.6777L46.5846 67.9781L47.5171 66.8754L59.0786 71.0962L58.1315 72.2162L48.4757 68.5725L48.4174 68.6414L53.6146 77.5577ZM50.5181 74.23L54.3356 69.7156L55.2833 70.517L51.4658 75.0314L50.5181 74.23Z" fill="url(#paint31_linear_15_1981)"/>
<path d="M36.0891 108.917L25.4506 104.411L28.1702 97.9905L29.313 98.4746L27.1391 103.607L30.7338 105.129L32.7669 100.33L33.9097 100.814L31.8766 105.614L35.492 107.145L37.7011 101.93L38.844 102.414L36.0891 108.917Z" fill="url(#paint32_linear_15_1981)"/>
<path d="M21.0485 118.459L31.3479 117.933L31.3863 117.803L23.0354 111.752L23.452 110.346L33.3248 117.695L32.9145 119.08L20.6319 119.866L21.0485 118.459Z" fill="url(#paint33_linear_15_1981)"/>
<path d="M25.2907 126.073C26.4913 126.281 27.4912 126.678 28.2904 127.263C29.0897 127.849 29.6608 128.561 30.0039 129.399C30.347 130.237 30.4342 131.142 30.2657 132.113C30.0971 133.083 29.7101 133.906 29.1045 134.579C28.499 135.253 27.7213 135.73 26.7716 136.012C25.8218 136.294 24.7466 136.33 23.5461 136.122C22.3455 135.914 21.3456 135.517 20.5464 134.931C19.7471 134.346 19.176 133.634 18.8329 132.796C18.4898 131.958 18.4026 131.053 18.5711 130.082C18.7397 129.111 19.1267 128.289 19.7323 127.616C20.3378 126.942 21.1155 126.464 22.0652 126.183C23.015 125.901 24.0902 125.864 25.2907 126.073ZM25.0591 127.407C24.0735 127.236 23.213 127.256 22.4776 127.468C21.7429 127.677 21.1528 128.03 20.7073 128.529C20.2625 129.025 19.9803 129.617 19.8606 130.306C19.741 130.995 19.8067 131.65 20.0579 132.27C20.3097 132.886 20.7461 133.418 21.3669 133.866C21.9884 134.31 22.792 134.617 23.7777 134.788C24.7633 134.959 25.6235 134.941 26.3582 134.732C27.0936 134.52 27.6837 134.166 28.1285 133.671C28.5739 133.172 28.8565 132.578 28.9762 131.889C29.0958 131.199 29.0297 130.547 28.7779 129.93C28.5267 129.31 28.0904 128.779 27.4689 128.335C26.8481 127.887 26.0448 127.578 25.0591 127.407Z" fill="url(#paint34_linear_15_1981)"/>
<path d="M28.4463 148.283L16.9146 147.574L17.0004 146.178L27.2934 146.81L27.6228 141.45L28.8616 141.526L28.4463 148.283Z" fill="url(#paint35_linear_15_1981)"/>
<path d="M20.4161 163.775C19.8546 163.901 19.4417 164.221 19.1774 164.732C18.9132 165.244 18.8174 165.847 18.89 166.543C18.9431 167.052 19.0718 167.488 19.2763 167.853C19.4803 168.213 19.7374 168.485 20.0477 168.668C20.3576 168.848 20.6958 168.918 21.0624 168.88C21.3691 168.848 21.6252 168.748 21.8307 168.579C22.032 168.407 22.1935 168.197 22.3152 167.95C22.4332 167.703 22.5256 167.448 22.5926 167.183C22.6558 166.92 22.7044 166.678 22.7382 166.459L22.9306 165.259C22.9779 164.952 23.0517 164.608 23.1518 164.227C23.2516 163.842 23.4036 163.469 23.6078 163.107C23.808 162.742 24.0817 162.43 24.429 162.171C24.7762 161.911 25.2192 161.753 25.7579 161.697C26.3788 161.632 26.9569 161.737 27.4921 162.01C28.0269 162.279 28.4745 162.709 28.8348 163.299C29.1947 163.885 29.4207 164.62 29.5129 165.503C29.5988 166.325 29.5403 167.052 29.3376 167.682C29.1345 168.308 28.8134 168.818 28.3742 169.212C27.9347 169.602 27.4031 169.852 26.7793 169.962L26.6294 168.526C27.0594 168.443 27.4033 168.26 27.661 167.976C27.9146 167.689 28.0901 167.341 28.1875 166.934C28.2808 166.524 28.3036 166.09 28.256 165.634C28.2006 165.103 28.0648 164.635 27.8486 164.23C27.6287 163.826 27.3506 163.516 27.0143 163.302C26.6744 163.088 26.2949 163.002 25.876 163.046C25.4944 163.086 25.1951 163.225 24.9779 163.463C24.7608 163.701 24.5955 164.002 24.4822 164.366C24.3689 164.729 24.2772 165.119 24.2072 165.534L23.9508 166.991C23.7864 167.915 23.4921 168.664 23.0679 169.238C22.6438 169.812 22.0446 170.139 21.2703 170.22C20.6269 170.287 20.0477 170.172 19.5325 169.874C19.0133 169.572 18.5901 169.14 18.2628 168.577C17.9314 168.01 17.7274 167.36 17.6509 166.627C17.5736 165.887 17.6377 165.214 17.8432 164.611C18.0449 164.007 18.3563 163.513 18.7776 163.129C19.1984 162.741 19.6977 162.507 20.2756 162.428L20.4161 163.775Z" fill="url(#paint36_linear_15_1981)"/>
<path d="M19.333 177.197L30.6858 175.053L30.9455 176.427L19.5927 178.572L19.333 177.197Z" fill="url(#paint37_linear_15_1981)"/>
<path d="M36.3152 194.273L37.5134 197.631L26.6319 201.514L25.3806 198.007C25.0039 196.952 24.8995 195.971 25.0672 195.064C25.2314 194.159 25.6476 193.362 26.316 192.672C26.9807 191.984 27.8763 191.439 29.0028 191.037C30.1362 190.632 31.1842 190.486 32.1465 190.598C33.1053 190.711 33.9421 191.075 34.6568 191.691C35.3681 192.307 35.9209 193.168 36.3152 194.273ZM35.8743 196.731L35.1766 194.775C34.8556 193.876 34.416 193.192 33.8577 192.724C33.2995 192.257 32.648 191.992 31.9033 191.93C31.1585 191.869 30.3433 191.996 29.4578 192.312C28.5793 192.625 27.8743 193.039 27.3426 193.552C26.8074 194.066 26.4715 194.669 26.3349 195.361C26.1949 196.054 26.2765 196.825 26.5798 197.675L27.3306 199.779L35.8743 196.731Z" fill="url(#paint38_linear_15_1981)"/>
<path d="M42.9365 209.067L32.5594 214.147L29.4939 207.884L30.6086 207.339L33.059 212.345L36.5654 210.628L34.2737 205.947L35.3884 205.401L37.6801 210.083L41.2067 208.357L38.7166 203.269L39.8313 202.724L42.9365 209.067Z" fill="url(#paint39_linear_15_1981)"/>
<path d="M49.5491 219.861L39.7688 226.011L36.0568 220.109L37.1074 219.448L40.0746 224.166L43.3793 222.088L40.6042 217.676L41.6548 217.015L44.4299 221.427L47.7536 219.337L44.7383 214.542L45.7889 213.882L49.5491 219.861Z" fill="url(#paint40_linear_15_1981)"/>
<path d="M44.1231 231.827L53.1456 224.611L53.9913 225.668L50.8397 236.251L50.9102 236.339L57.9943 230.673L58.8681 231.765L49.8456 238.982L49 237.924L52.1551 227.31L52.0846 227.222L44.9829 232.902L44.1231 231.827Z" fill="url(#paint41_linear_15_1981)"/>
<path d="M73.5233 245.781L65.9122 254.473L60.6663 249.88L61.4839 248.946L65.6772 252.618L68.249 249.681L64.3273 246.247L65.1449 245.313L69.0666 248.747L71.6532 245.793L67.3919 242.062L68.2095 241.128L73.5233 245.781Z" fill="url(#paint42_linear_15_1981)"/>
<path d="M86.8134 254.92L82.9958 266.273L81.8155 265.48L85.0563 256.322L84.9627 256.259L77.6752 262.7L76.3638 261.82L79.5672 252.636L79.4735 252.573L72.2235 259.04L71.0433 258.247L80.1065 250.416L81.3055 251.221L78.2903 260.286L78.3652 260.337L85.6144 254.114L86.8134 254.92Z" fill="url(#paint43_linear_15_1981)"/>
<path d="M106.325 264.638L101.812 275.274L100.524 274.727L104.552 265.234L99.6085 263.136L100.093 261.994L106.325 264.638Z" fill="url(#paint44_linear_15_1981)"/>
<path d="M117.837 268.366L114.404 279.397L113.068 278.982L116.132 269.135L111.004 267.539L111.373 266.354L117.837 268.366Z" fill="url(#paint45_linear_15_1981)"/>
<path d="M130.973 271.129L132.412 271.415L125.996 281.919L124.58 281.637L122.674 269.478L124.112 269.764L125.601 279.977L125.689 279.994L130.973 271.129ZM129.561 275.45L123.763 274.296L124.005 273.079L129.803 274.233L129.561 275.45Z" fill="url(#paint46_linear_15_1981)"/>
<g filter="url(#filter0_d_15_1981)">
<path d="M185 196.883L185.005 197.274C185.208 205.311 191.637 211.791 199.612 211.995L200 212C208.284 212 214.999 205.231 215 196.883V109.717C215 96.0781 205.18 84.5734 192.016 82.3771L191.387 82.2794L190.072 82.1232L188.758 82.0304C175.645 81.4151 163.886 90.2065 160.666 103.031L160.373 104.33L149.998 155.717L139.631 104.33L139.334 103.031C136.115 90.2075 124.358 81.4163 111.246 82.0304L109.928 82.1232C95.7989 83.4601 85 95.4154 85 109.717V196.883C85.0007 205.231 91.7161 212 100 212C108.284 212 114.999 205.231 115 196.883V133.99L128.301 199.895C129.722 206.938 135.868 212 143 212H157L157.666 211.985C164.291 211.691 169.946 207.033 171.552 200.549L171.699 199.895L185 133.99V196.883ZM222.943 196.884C222.942 209.56 212.729 219.943 200 219.943H199.999C190.111 219.943 181.742 213.676 178.498 204.936C175.211 213.811 166.733 219.943 157 219.943H143C133.268 219.943 124.788 213.811 121.501 204.936C118.258 213.676 109.889 219.943 100 219.943C87.2707 219.943 77.0577 209.56 77.0566 196.884V109.717C77.0566 91.3694 90.9216 75.9436 109.18 74.216L109.37 74.2003L110.688 74.1066L110.874 74.0958C127.539 73.3153 142.435 84.295 146.836 100.33L147.038 101.097L147.077 101.26L147.374 102.56L147.417 102.76L150 115.567L152.587 102.758C152.599 102.699 152.612 102.641 152.625 102.583L152.918 101.284L152.962 101.098C157.028 84.9022 171.73 73.6571 188.338 74.0675L189.131 74.0958L189.317 74.1076L190.632 74.2003L191.009 74.2355L192.323 74.3917L192.512 74.4161C209.933 76.9096 222.943 91.9396 222.943 109.717V196.884Z" fill="white" fill-opacity="0.32" shape-rendering="crispEdges"/>
</g>
<g filter="url(#filter1_d_15_1981)">
<path d="M185 196.883V133.99L171.699 199.895C170.277 206.938 164.132 212 157 212H143C135.868 212 129.723 206.938 128.301 199.895L115 133.99V196.883C115 205.231 108.284 212 100 212C91.7162 212 85.0007 205.231 85 196.883V109.717C85 95.415 95.7989 83.4601 109.928 82.1232L111.246 82.0304C124.358 81.4163 136.114 90.2073 139.334 103.031L139.631 104.33L149.998 155.717L160.373 104.33L160.666 103.031C163.886 90.2062 175.645 81.4149 188.758 82.0304L190.072 82.1232L191.386 82.2792C204.866 84.2085 215 95.8613 215 109.717V196.883C214.999 205.231 208.284 212 200 212C191.717 211.999 185 205.231 185 196.883Z" fill="black"/>
</g>
<defs>
<filter id="filter0_d_15_1981" x="69.1136" y="74.0566" width="161.773" height="161.773" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="7.94307"/>
<feGaussianBlur stdDeviation="3.97153"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_15_1981"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_15_1981" result="shape"/>
</filter>
<filter id="filter1_d_15_1981" x="77.0569" y="82" width="145.886" height="145.886" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="7.94307"/>
<feGaussianBlur stdDeviation="3.97153"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_15_1981"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_15_1981" result="shape"/>
</filter>
<radialGradient id="paint0_radial_15_1981" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(43.7224 54.6442) rotate(31.3167) scale(287.774 439.129)">
<stop stop-color="#FF63D9"/>
<stop offset="0.356048" stop-color="#F6FFA8"/>
<stop offset="0.562826" stop-color="#FFCDF3"/>
<stop offset="0.783654" stop-color="#FF81E0"/>
<stop offset="1" stop-color="#FF4FD4"/>
</radialGradient>
<linearGradient id="paint1_linear_15_1981" x1="149.961" y1="5" x2="149.961" y2="294.922" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.485577" stop-opacity="0.19"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint2_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint3_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint4_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint5_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint6_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint7_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint8_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint9_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint10_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint11_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint12_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint13_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint14_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint15_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint16_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint17_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint18_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint19_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint20_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint21_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint22_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint23_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint24_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint25_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint26_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint27_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint28_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint29_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint30_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint31_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint32_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint33_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint34_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint35_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint36_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint37_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint38_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint39_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint40_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint41_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint42_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint43_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint44_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint45_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
<linearGradient id="paint46_linear_15_1981" x1="62" y1="40.5" x2="246" y2="258.5" gradientUnits="userSpaceOnUse">
<stop/>
<stop offset="0.366667" stop-opacity="0.52"/>
<stop offset="1"/>
</linearGradient>
</defs>
</svg>`

// Renders the embedded SVG sticker onto an offscreen canvas at a higher
// resolution than its native 300x300 (for a crisp downloaded PNG), then
// triggers a normal file download. Falls back to opening the raw SVG in
// a new tab if rasterization fails for any reason.
function downloadSvgAsPng(svgMarkup, filename, scale = 4) {
    try {
        const svgBlob = new Blob([svgMarkup], {
            type: "image/svg+xml;charset=utf-8",
        })
        const svgUrl = URL.createObjectURL(svgBlob)
        const img = new Image()
        img.onload = () => {
            const w = img.naturalWidth || 300
            const h = img.naturalHeight || 300
            const canvas = document.createElement("canvas")
            canvas.width = w * scale
            canvas.height = h * scale
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(svgUrl)
            canvas.toBlob((blob) => {
                if (!blob) return
                const pngUrl = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = pngUrl
                a.download = filename
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(pngUrl)
            }, "image/png")
        }
        img.onerror = () => {
            URL.revokeObjectURL(svgUrl)
            const fallbackUrl =
                "data:image/svg+xml;charset=utf-8," +
                encodeURIComponent(svgMarkup)
            window.open(fallbackUrl, "_blank")
        }
        img.src = svgUrl
    } catch (e) {
        // Ignore — user simply won't get a download in this edge case.
    }
}

const HEART_D =
    "M-1 9.78C-1 8.211 -0.527 6.678 0.355 5.385C1.238 4.092 2.49 3.098 3.944 2.537C5.399 1.975 6.989 1.871 8.503 2.239C10.018 2.606 11.386 3.428 12.427 4.595C12.501 4.674 12.589 4.737 12.688 4.78C12.786 4.824 12.893 4.846 13 4.846C13.107 4.846 13.214 4.824 13.312 4.78C13.411 4.737 13.499 4.674 13.573 4.595C14.611 3.42 15.979 2.592 17.496 2.22C19.013 1.848 20.607 1.95 22.065 2.513C23.523 3.076 24.776 4.073 25.657 5.371C26.539 6.669 27.007 8.207 27 9.78C27 13.01 24.9 15.422 22.8 17.538L15.111 25.031C14.85 25.333 14.529 25.576 14.168 25.743C13.807 25.91 13.414 25.997 13.017 26C12.62 26.002 12.227 25.92 11.864 25.757C11.5 25.595 11.176 25.357 10.911 25.058L3.2 17.538C1.1 15.422 -1 13.024 -1 9.78Z"

// Inject Inter font + placeholder colour once
function useGlobalStyle() {
    useEffect(() => {
        if (typeof document === "undefined") return
        if (!document.getElementById("riddle-font")) {
            const l = document.createElement("link")
            l.id = "riddle-font"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            document.head.appendChild(l)
        }
        if (!document.getElementById("riddle-style")) {
            const s = document.createElement("style")
            s.id = "riddle-style"
            s.textContent =
                ".riddle-input::placeholder{color:rgba(0,0,0,.5);opacity:1}" +
                ".riddle-input{caret-color:#000}"
            document.head.appendChild(s)
        }
    }, [])
}

// Build a perfect circle once (no DOM measurement needed — always available
// immediately, even before layout/fonts are ready on mobile).
function buildCircle(N) {
    const cx = 13,
        cy = 13,
        r = 12.5
    const pts = []
    for (let i = 0; i < N; i++) {
        const th = Math.PI + (2 * Math.PI * i) / N
        pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)])
    }
    return pts
}

// Sample the exact heart path into N points. Requires the DOM, so this is
// only ever called from inside a useEffect (after mount), never during render.
function buildHeart(N, fallback) {
    if (typeof document === "undefined") return fallback
    try {
        const ns = "http://www.w3.org/2000/svg"
        const tmp = document.createElementNS(ns, "svg")
        tmp.style.cssText =
            "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"
        const p = document.createElementNS(ns, "path")
        p.setAttribute("d", HEART_D)
        tmp.appendChild(p)
        document.body.appendChild(tmp)
        const total = p.getTotalLength()
        const pts = []
        if (total > 0) {
            for (let i = 0; i < N; i++) {
                const pt = p.getPointAtLength((total * i) / N)
                pts.push([pt.x, pt.y])
            }
        }
        document.body.removeChild(tmp)
        return pts.length === N ? pts : fallback
    } catch (e) {
        return fallback
    }
}

const POINT_COUNT = 200

// ---------------------------------------------------------------------------
// Full-screen confetti burst — three piece shapes mixed together: squares
// (GitHub-contribution-graph style, the majority), small hearts (reusing
// the exact button heart outline), and short ribbons that flutter/curl as
// they fall. Colored from the site's background gradient palette. Bursts
// outward from a given origin point (the field itself), renders into a
// fixed, full-viewport canvas appended to document.body. Self-contained:
// mounts, plays once, cleans itself up.
// ---------------------------------------------------------------------------

// Same hue family as the marcello.design hero background gradient, but
// with a bit more saturation/depth so the pieces stay readable against a
// background made of nearly the same tones.
const VIVID_COLORS = [
    "#E888D4", // pink/magenta
    "#A481DE", // lavender purple
    "#8B86CC", // muted periwinkle
    "#D9BE8E", // warm cream/beige
    "#B8B0A2", // warm gray
    "#B98FCB", // pale mauve
    "#8E9DCC", // blue-lavender
    "#CC96AE", // dusty rose
]

// Reusable Path2D built once from the same heart outline used for the
// button-morph animation, so confetti hearts and the button heart match.
const CONFETTI_HEART_PATH =
    typeof Path2D !== "undefined" ? new Path2D(HEART_D) : null

function fireConfetti({
    originX,
    originY,
    particleCount = 260,
    duration = 4200,
} = {}) {
    if (typeof document === "undefined") return

    const canvas = document.createElement("canvas")
    canvas.style.cssText =
        "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;"
    document.body.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    // Origin defaults to the screen center if no coordinates are passed in,
    // but callers should pass the field's own on-screen position so the
    // explosion visibly originates from it.
    const ox = originX ?? W() / 2
    const oy = originY ?? H() / 2

    const rand = (a, b) => a + Math.random() * (b - a)

    const particles = Array.from({ length: particleCount }).map(() => {
        const angle = rand(0, Math.PI * 2)

        // Roughly a third of the pieces are deliberately "lazy" — much
        // slower and lighter, so they drift and hang in the air rather
        // than shooting out, giving the burst some depth instead of every
        // piece moving at a uniform speed.
        const isSlow = Math.random() < 0.32
        const speed = isSlow ? rand(1, 4) : rand(5, 17)

        // Shape roll: mostly squares, with hearts mixed in.
        const shape = Math.random() < 0.22 ? "heart" : "square"

        return {
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - rand(2, 7), // slight upward bias
            size: rand(5, 11),
            rotation: rand(0, Math.PI * 2),
            rotationSpeed: rand(-0.22, 0.22),
            gravity: isSlow ? rand(0.04, 0.09) : rand(0.14, 0.26),
            drag: isSlow ? rand(0.992, 0.998) : rand(0.985, 0.994),
            opacity: 1,
            // Vivid colors from the site's background palette; opacity
            // still varies per-piece (about half fully opaque, the rest
            // lighter) purely to add depth/variability to the burst.
            color: VIVID_COLORS[
                Math.floor(Math.random() * VIVID_COLORS.length)
            ],
            baseOpacity: Math.random() < 0.5 ? 1 : rand(0.4, 0.75),
            // fade-out start point varies a little per-particle so they
            // don't all disappear in lockstep at the very end
            fadeStart: rand(0.55, 0.75),
            shape,
        }
    })

    const start = performance.now()
    let raf = 0

    const tick = (now) => {
        const elapsed = now - start
        const t = elapsed / duration

        ctx.clearRect(0, 0, W(), H())

        let anyAlive = false

        for (const p of particles) {
            // physics
            p.vx *= p.drag
            p.vy = p.vy * p.drag + p.gravity
            p.x += p.vx
            p.y += p.vy
            p.rotation += p.rotationSpeed

            // fade out over the remaining time after each particle's own
            // fadeStart point
            p.opacity =
                (t < p.fadeStart
                    ? 1
                    : Math.max(0, 1 - (t - p.fadeStart) / (1 - p.fadeStart))) *
                p.baseOpacity

            if (p.opacity > 0 && p.y < H() + 40) {
                anyAlive = true
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(p.rotation)
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color

                if (p.shape === "heart" && CONFETTI_HEART_PATH) {
                    // The heart path's native coordinate space is roughly
                    // 26x26 (same as the button icon), centered around
                    // (13, 14) — scale it down to the particle's size and
                    // re-center it on the particle's own origin.
                    const scale = p.size / 20
                    ctx.scale(scale, scale)
                    ctx.translate(-13, -14)
                    ctx.fill(CONFETTI_HEART_PATH)
                } else {
                    // Square pieces, GitHub-contribution-graph style —
                    // slightly rounded corners read better at small sizes
                    // than hard right angles.
                    const s = p.size
                    const r = s * 0.18
                    ctx.beginPath()
                    ctx.moveTo(-s / 2 + r, -s / 2)
                    ctx.arcTo(s / 2, -s / 2, s / 2, s / 2, r)
                    ctx.arcTo(s / 2, s / 2, -s / 2, s / 2, r)
                    ctx.arcTo(-s / 2, s / 2, -s / 2, -s / 2, r)
                    ctx.arcTo(-s / 2, -s / 2, s / 2, -s / 2, r)
                    ctx.closePath()
                    ctx.fill()
                }
                ctx.restore()
            }
        }

        if (elapsed < duration && anyAlive) {
            raf = requestAnimationFrame(tick)
        } else {
            window.removeEventListener("resize", resize)
            canvas.remove()
        }
    }

    raf = requestAnimationFrame(tick)
}

export default function RiddleField(props) {
    const answer = props.correctAnswer || "love"

    useGlobalStyle()

    // Circle is available synchronously on first render — the button outline
    // is therefore never blank on mount, even on mobile.
    const circleRef = useRef(buildCircle(POINT_COUNT))
    const [heart, setHeart] = useState(null)

    useEffect(() => {
        let cancelled = false
        const id = requestAnimationFrame(() => {
            if (cancelled) return
            setHeart(buildHeart(POINT_COUNT, circleRef.current))
        })
        return () => {
            cancelled = true
            cancelAnimationFrame(id)
        }
    }, [])

    const [value, setValue] = useState("")
    const [status, setStatus] = useState("idle") // idle | correct | wrong
    const [morph, setMorph] = useState(0)
    const [labelW, setLabelW] = useState(150)
    const [strokeColor, setStrokeColor] = useState("#000")
    const labelRef = useRef(null)
    const morphRef = useRef(0)
    const raf = useRef(0)
    const cycleRef = useRef({ interval: 0, timeout: 0 })

    // Briefly alternates the field's 1px outline (border pill + button
    // icon) through the vivid confetti colors — quick flashes, e.g. black
    // -> pink -> green-ish/blue -> ... — for a couple of seconds, then
    // settles back to black. Runs alongside the confetti burst.
    const startStrokeColorCycle = () => {
        clearInterval(cycleRef.current.interval)
        clearTimeout(cycleRef.current.timeout)
        let i = 0
        cycleRef.current.interval = window.setInterval(() => {
            setStrokeColor(VIVID_COLORS[i % VIVID_COLORS.length])
            i++
        }, 90)
        cycleRef.current.timeout = window.setTimeout(() => {
            clearInterval(cycleRef.current.interval)
            setStrokeColor("#000")
        }, 1900)
    }

    useEffect(
        () => () => {
            clearInterval(cycleRef.current.interval)
            clearTimeout(cycleRef.current.timeout)
        },
        []
    )

    const [pos, setPos] = useState({ x: 0, y: 0 })
    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0,
    })
    const wrapperRef = useRef(null)

    useLayoutEffect(() => {
        if (labelRef.current) {
            const w = labelRef.current.getBoundingClientRect().width
            if (w && Math.abs(w - labelW) > 0.5) setLabelW(w)
        }
    })

    useEffect(() => () => cancelAnimationFrame(raf.current), [])

    const animate = (target) => {
        cancelAnimationFrame(raf.current)
        const start = morphRef.current,
            t0 = performance.now(),
            dur = 560
        const ease = (p) =>
            p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
        const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const m = start + (target - start) * ease(p)
            morphRef.current = m
            setMorph(m)
            if (p < 1) raf.current = requestAnimationFrame(step)
        }
        raf.current = requestAnimationFrame(step)
    }

    const onInput = (e) => {
        let v = e.target.value
        if (v) v = v.charAt(0).toUpperCase() + v.slice(1)
        if (status !== "idle") {
            animate(0)
            setStatus("idle")
            clearInterval(cycleRef.current.interval)
            clearTimeout(cycleRef.current.timeout)
            setStrokeColor("#000")
        }
        setValue(v)
    }

    const download = () => {
        downloadSvgAsPng(STICKER_SVG, "marcello.design.png")
    }

    const onSubmit = () => {
        if (status === "correct") {
            download()
            return
        }
        const t = String(answer).trim().toLowerCase()
        const a = value.trim().toLowerCase()
        if (a && a === t) {
            setStatus("correct")
            animate(1)
            startStrokeColorCycle()
            // Fire the confetti explosion from the field's own on-screen
            // position, so the burst visibly originates from it rather
            // than from the center of the screen.
            const rect = wrapperRef.current?.getBoundingClientRect()
            fireConfetti({
                originX: rect ? rect.left + rect.width / 2 : undefined,
                originY: rect ? rect.top + rect.height / 2 : undefined,
            })
        } else {
            setStatus("wrong")
        }
    }

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            onSubmit()
        }
    }

    const pathFor = (m) => {
        const circle = circleRef.current
        const target = heart || circle
        let d = "M"
        for (let i = 0; i < POINT_COUNT; i++) {
            const a = circle[i],
                b = target[i]
            const x = a[0] + (b[0] - a[0]) * m
            const y = a[1] + (b[1] - a[1]) * m
            d += (i ? "L" : "") + x.toFixed(2) + " " + y.toFixed(2) + " "
        }
        return d + "Z"
    }

    const buildBorder = (lw) => {
        const W = 240,
            H = 50,
            inset = 0.5
        const r = H / 2 - inset
        const cy = H / 2
        const leftC = H / 2,
            rightC = W - H / 2
        const top = inset,
            bottom = H - inset
        const labelLeft = 16,
            pad = 6
        const gapL = labelLeft - pad
        const gapR = labelLeft + lw + pad
        const dx = gapL - leftC
        const dy = -Math.sqrt(Math.max(0, r * r - dx * dx))
        const gapLY = cy + dy
        return (
            `M ${gapR.toFixed(2)} ${top} L ${rightC} ${top}` +
            ` A ${r} ${r} 0 0 1 ${rightC} ${bottom}` +
            ` L ${leftC} ${bottom}` +
            ` A ${r} ${r} 0 0 1 ${gapL} ${gapLY.toFixed(2)}`
        )
    }

    const feedback =
        status === "correct"
            ? "Correct! Love is all we need. Download it."
            : status === "wrong"
              ? "Try again"
              : "\u00A0"

    const m = morph

    return (
        <div
            ref={wrapperRef}
            style={{
                fontFamily: "Inter, sans-serif",
                width: 252,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                touchAction: "none",
                cursor: "grab",
            }}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture?.(e.pointerId)
                dragRef.current = {
                    dragging: true,
                    startX: e.clientX,
                    startY: e.clientY,
                    baseX: pos.x,
                    baseY: pos.y,
                }
            }}
            onPointerMove={(e) => {
                if (!dragRef.current.dragging) return
                const dx = e.clientX - dragRef.current.startX
                const dy = e.clientY - dragRef.current.startY
                setPos({
                    x: dragRef.current.baseX + dx,
                    y: dragRef.current.baseY + dy,
                })
            }}
            onPointerUp={(e) => {
                dragRef.current.dragging = false
                e.currentTarget.releasePointerCapture?.(e.pointerId)
            }}
            onPointerCancel={() => {
                dragRef.current.dragging = false
            }}
        >
            <div style={{ position: "relative", width: 240, height: 50 }}>
                <svg
                    viewBox="0 0 240 50"
                    width={240}
                    height={50}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        overflow: "visible",
                        display: "block",
                        pointerEvents: "none",
                    }}
                >
                    <path
                        d={buildBorder(labelW)}
                        stroke={strokeColor}
                        strokeWidth={1}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span
                    ref={labelRef}
                    style={{
                        position: "absolute",
                        left: 16,
                        top: -4,
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        color: "#000",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                    }}
                >
                    Give it away to have{" "}
                    <span style={{ fontWeight: 600 }}>more</span>. What is it?
                </span>
                <input
                    className="riddle-input"
                    type="text"
                    value={value}
                    onChange={onInput}
                    onKeyDown={onKeyDown}
                    onPointerDown={(e) => {
                        e.stopPropagation()
                    }}
                    placeholder="Type the answer"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    style={{
                        position: "absolute",
                        left: 16,
                        right: 46,
                        top: "50%",
                        transform: "translateY(calc(-50% + 1px))",
                        width: "auto",
                        height: 20,
                        lineHeight: "20px",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 16,
                        WebkitTextSizeAdjust: "100%",
                        fontWeight: 400,
                        letterSpacing: 0,
                        color: "#000",
                        caretColor: "#000",
                        padding: 0,
                        margin: 0,
                        zIndex: 2,
                        pointerEvents: "auto",
                        cursor: "text",
                        WebkitUserSelect: "text",
                        userSelect: "text",
                        touchAction: "manipulation",
                    }}
                />
                <button
                    type="button"
                    onClick={onSubmit}
                    onPointerDown={(e) => {
                        e.stopPropagation()
                    }}
                    aria-label={
                        status === "correct" ? "Download" : "Submit answer"
                    }
                    style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 26,
                        height: 26,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        touchAction: "manipulation",
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    <svg
                        viewBox="0 0 26 26"
                        width={26}
                        height={26}
                        style={{ display: "block", overflow: "visible" }}
                    >
                        <path
                            d={pathFor(m)}
                            stroke={strokeColor}
                            strokeWidth={1}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <g
                            transform={`translate(0 ${m * 1.25}) rotate(${
                                m * 90
                            } 13 13)`}
                            stroke={strokeColor}
                            strokeWidth={1}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1={7.75} y1={13} x2={18.25} y2={13} />
                            <polyline points="13,7.75 18.25,13 13,18.25" />
                        </g>
                    </svg>
                </button>
            </div>
            <div
                style={{
                    minHeight: 13,
                    marginTop: 5,
                    marginLeft: 16,
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: "#000",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                }}
            >
                {feedback}
            </div>
        </div>
    )
}

RiddleField.defaultProps = { correctAnswer: "love" }

addPropertyControls(RiddleField, {
    correctAnswer: {
        type: ControlType.String,
        title: "Answer",
        defaultValue: "love",
    },
})
