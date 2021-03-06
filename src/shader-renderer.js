/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
import { LitElement, html } from 'lit-element';
import * as dat from 'dat.gui';
import { renderScene } from './three-scene.js'
import { genCharacters} from './core-glsl.js';

export class StartLitElement extends LitElement {
  
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      width: { type: String },
      height: { type: String },
      params: {type: Object},
      mouse: {type: Object}
    };
  }

  /**  
   * In the element constructor, assign default property values.
   */
  constructor() {
    // Must call superconstructor first.
    super();
    this.spSculptureId = '';
    this.width = '100vw';
    this.height = '100vh';
    this.mouse = {
      x: 1,
      y: 1
    }

    this.color1 = {
      color: [0, 255, 255],
      alpha: 0.67,
      xOffset: -.072,
      yOffset: 0.048,
      blurRadius: 0.25,
      speed: 0.56,
      amplitude: 0.0012,
      scale: 1.0,
      noiseEnabled: false
    }

    this.color2 = {
      color: [255, 255, 0],
      alpha: 0.75,
      xOffset: 0.0754,
      yOffset: -0.037,
      blurRadius: .3,
      speed: 0.5,
      amplitude: 0.011,
      scale: 0.7,
      noiseEnabled: false
    }

    this.color3 = {
      color: [255, 0, 0],
      alpha: 0.75,
      xOffset: 0.019,
      yOffset: -0.049,
      blurRadius: 0.25,
      speed: 0.05,
      amplitude: 0.0,
      scale: 1.4,
      noiseEnabled: false
    }

    this.params = {
      blur: 1.,
      contrast: 0.9,
      brightness: 3.0,
      invert: 3.0,
      invertScene: true,
      fontSize: 17.0,
      letterSpacing: -0.0001,
      lineHeight: 0.55,
      opacity: 1,
      textAlign: 'center',
      displacement: 'linear',
      displacementScale: 4.0,
      xOffset: 0.2,
      yOffset: 0.0001,
      
      text: 'LAS',
      mouseMovementSpeed: 0.02,
      backgroundColor: 0.0,
      resolution: [0, 0],
      pauseAnimation: true
    }

    this.export = {
      width: 4096,
      height: 2160,
      downloadPNG: () => this.downloadPNG()
    }

    let mobileCheck = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) mobileCheck = true; })(navigator.userAgent || navigator.vendor || window.opera);

    if(mobileCheck) {
        // this.params.blur = 1.33;
        this.params.fontSize = 15.0;
    }

    this.bloom = {
      distinction : 2.0,
      resolutionScale: 0.2,
      opacity: 1.0
    }

    this.kerning = {
      xOffsetScale: 0.0001,
      xAdvanceScale: 0.016
    }

    this.gui = new dat.GUI();
    // this.gui.remember(this.export);
    // this.gui.remember(this.params);
    // this.gui.remember(this.color1);
    // this.gui.remember(this.color2);
    // this.gui.remember(this.color3);
    // this.gui.remember(this.bloom);
    // this.gui.remember(this.kerning);

    
    // let el = (this.gui.domElement.style.display = 'none');
    document.querySelector('.dg').style.zIndex = 999;
    window.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

    let text = this.gui.addFolder('Text');
    text.add(this.params, 'text')
      .onChange(() => {
        let chrs = genCharacters(this.params.text, this.params.textAlign);
        window.characters = chrs;
        window.refreshMaterial();
      }).listen();
    text.add(this.params, 'textAlign', ['left', 'center'])
      .onChange(() => {
        this.requestUpdate();
        let chrs = genCharacters(this.params.text, this.params.textAlign);
        window.characters = chrs;
        window.refreshMaterial();
      });
    text.add(this.params, 'fontSize', 10.0, 18.5)
      .onChange((val) => {
        this.params.blur = Math.max(0.1, val * 0.1 - 0.7);
        this.requestUpdate()
      });
    text.add(this.params, 'lineHeight', -2.0, 2.0)
      .onChange(() => this.requestUpdate());
    text.add(this.params, 'xOffset', -2.5, 2.5)
      .onChange(() => this.requestUpdate());
    text.add(this.params, 'yOffset', -2.5, 2.5)
      .onChange(() => this.requestUpdate());
    let color1 = this.gui.addFolder('Color 1');
    this.initColorUI(color1, this.color1);

    let color2 = this.gui.addFolder('Color 2');
    this.initColorUI(color2, this.color2);

    let color3 = this.gui.addFolder('Color 3');
    this.initColorUI(color3, this.color3);
    
    this.gui.add(this.params, 'pauseAnimation')
      .onChange((val) => {
        this.pausePlayAnimation(val);
      }).listen();
    
    let exportFolder = this.gui.addFolder('Export');
    exportFolder.add(this.export, 'width', 0, 4500);
    exportFolder.add(this.export, 'height', 0, 4500);
    exportFolder.add(this.export, 'downloadPNG');

    let advancedFolder = this.gui.addFolder('Advanced');

    let kerning = advancedFolder.addFolder('Kerning');
    let kerningOnChange = (offset) => {
      let val = this.kerning[offset] === 0.0 ? 0.0001 : this.kerning[offset];
      window[offset] = val;
      let chrs = genCharacters(this.params.text, this.params.textAlign);
      window.characters = chrs;
      this.requestUpdate();
      window.refreshMaterial();
    }
    kerning.add(this.kerning, 'xOffsetScale', -0.05, 0.05)
      .onChange(() => kerningOnChange('xOffsetScale'));
    kerning.add(this.kerning, 'xAdvanceScale', 0.0, 0.02)
      .onChange(() => kerningOnChange('xAdvanceScale'));
    advancedFolder.add(this.params, 'blur', 0.0, 3.5)
      .onChange(() => this.requestUpdate()).listen();
    advancedFolder.add(this.params, 'contrast', 0.0, 1.0)
      .onChange(() => this.requestUpdate());
    // advancedFolder.add(this.params, 'brightness', 0.0, 3.5)
    //   .onChange(() => this.requestUpdate());
    // advancedFolder.add(this.params, 'invert', 0.0, 3.5)
    //   .onChange(() => {
    //     this.params.backgroundColor = 255 * ((3.0 - this.params.invert));
    //     this.requestUpdate();
    //   }).listen();
    advancedFolder.add(this.params, 'invertScene').onChange(() => {
      this.params.invert = this.params.invertScene? 3.0: 1.0;
      this.params.backgroundColor = 255 * ((3.0 - this.params.invert));
      this.requestUpdate();
    })

    kerning.add(this.params, 'letterSpacing', -1.5, 1.5)
      .onChange(() => this.requestUpdate());

    advancedFolder.add(this.params, 'displacement', ['noise', 'linear']).onChange(() => {
      let linear = {scale: 0.001, amplitude: 0.021};
      let noise = {scale: 1.0, amplitude: 0.03, time : 0.1}
      let displacement = this.params.displacement === 'linear'? linear: noise;
      [this.color1, this.color2, this.color3].forEach(col => Object.assign(col, displacement));
    }).listen();
    advancedFolder.add(this.params, 'displacementScale', 0.001, 10.0)
      .onChange(() => this.requestUpdate());
    advancedFolder.add(this.params, 'mouseMovementSpeed', 0., 0.1);
  }

  initColorUI(folder, param) {
    folder.addColor(param, 'color')
      .onChange(() => this.requestUpdate());
    let advanced = folder.addFolder('Advanced');
    advanced.add(param, 'alpha', 0.0, 1.0)
      .onChange(() => this.requestUpdate());
    advanced.add(param, 'xOffset', -0.25, 0.25)
      .onChange(() => this.requestUpdate());
    advanced.add(param, 'yOffset', -0.25, 0.25)
      .onChange(() => this.requestUpdate());
    // folder.add(param, 'blurRadius', 0.0, 1.0)
    //   .onChange(() => this.requestUpdate());
    let noiseFolder = advanced.addFolder('Noise');
    noiseFolder.add(param, 'speed', 0.0, 1.0)
      .onChange(() => this.requestUpdate());
    noiseFolder.add(param, 'amplitude', 0.0, 0.12)
      .onChange(() => this.requestUpdate());
    noiseFolder.add(param, 'scale', 0.1, 5.0)
      .onChange(() => this.requestUpdate());
    noiseFolder.add(param, 'noiseEnabled')
      .onChange(() => this.requestUpdate());
  }

  /**
   * Define a template for the new element by implementing LitElement's
   * `render` function. `render` must return a lit-html TemplateResult.
   */
  render() {
    return html`
      <style>
        :host { display: block; }
        :host([hidden]) { display: none; }

        @font-face {
          font-family: 'Helvetica neue';
          src: url('./fonts/HelveticaNeue-Bold.woff') format('woff');
          font-weight: 700;
          font-style: normal;
        }

        @font-face {
          font-family: 'Helvetica neue';
          src: url('./fonts/HelveticaNeue-Bold.woff') format('woff');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'Helvetica';
          src: url('./fonts/HelveticaNeue-Bold.woff') format('woff');
          font-weight: 700;
          font-style: normal;
        }
        input[type=text] {
          border: none;
          background-color: transparent;
        }

        .container {
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          width:  ${this.width};
          height:  ${this.height};
          -webkit-box-pack: center;
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          // justify-content: center;
          -webkit-box-align: center;
          -webkit-align-items: center;
          -ms-flex-align: center;
          align-items: center;
          background-color: #000;
          opacity: ${this.params.opacity};
          //-webkit-filter: invert(${this.params.invert}%) ;
          //filter: invert(${this.params.invert}%) ;
        }

        canvas {
            font-family: 'Helvetica neue', 'Arial', sans-serif;
            color: #fff;
            width: 100%;
            font-weight: bold;
            background-color: rgb(${this.params.backgroundColor}, ${this.params.backgroundColor}, ${this.params.backgroundColor});
            font-size: ${this.params.fontSize}px;
            text-align: ${this.params.textAlign};
            letter-spacing: ${this.params.letterSpacing}px;
            display: block;
            // -webkit-filter: blur(${this.params.blur}px);
            // filter: blur(${this.params.blur}px);
            // -webkit-filter: contrast(${this.params.contrast * 500}%);
            // filter: contrast(${this.params.contrast * 500}%);
            // text-shadow: ${this.color1.xOffset - this.mouse.x}px ${this.color1.yOffset - this.mouse.y}px ${this.color1.blurRadius}px rgba(${this.color1.color[0]}, ${this.color1.color[1]}, ${this.color1.color[2]}, ${this.color1.color[3]}), 
            //              ${this.color2.xOffset - this.mouse.x}px ${this.color2.yOffset - this.mouse.y}px ${this.color2.blurRadius}px rgba(${this.color2.color[0]}, ${this.color2.color[1]}, ${this.color2.color[2]}, ${this.color2.color[3]}), 
            //              ${this.color3.xOffset - this.mouse.x}px ${this.color3.yOffset - this.mouse.y}px ${this.color3.blurRadius}px rgba(${this.color3.color[0]}, ${this.color3.color[1]}, ${this.color3.color[2]}, ${this.color3.color[3]});
                         
        }
      </style>
      <div id="container" class="container">
        
        
      </div>
    `;
  }

  /**
   * Implement firstUpdated to perform one-time work on first update:
   * - Call a method to load the lazy element if necessary
   * - Focus the checkbox
   */
  firstUpdated() {
      const canvasEl = this.shadowRoot.getElementById('container');
    let { downloadScreenShot, pausePlayAnimation} = renderScene(canvasEl, {
        color1 :this.color1, 
        color2: this.color2, 
        color3: this.color3, 
        params: this.params, 
        bloom:this.bloom,
        export: this.export
      });

      window.refreshMaterial();
      window.text = this.params.text;
      this.downloadScreenShot = downloadScreenShot;
      this.pausePlayAnimation = pausePlayAnimation
      this.pausePlayAnimation(true);
      this.params.displacement = "linear";
  }

  downloadPNG() {
    console.log('this.downloadScreenShot', this.downloadScreenShot)
    if(this.downloadScreenShot) {
      this.downloadScreenShot(this.export.width, this.export.height);
    }
  }

  pausePlayAnimation(val) {
    if (this.pausePlayAnimation) {
      this.pausePlayAnimation(val);
    }
  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    this.mouse.x = (((event.clientX - 0.5) / window.innerWidth) * 2 - 1) * this.params.mouseMovementSpeed ;
    this.mouse.y = -(- ((event.clientY - 0.5) / window.innerHeight) * 2 + 1) * this.params.mouseMovementSpeed;
    // this.requestUpdate();
  }

}

// Register the element with the browser
customElements.define('shader-renderer', StartLitElement);
