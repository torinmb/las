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

export class StartLitElement extends LitElement {
  
  /**
   * Define properties. Properties defined here will be automatically 
   * observed.
   */
  static get properties() {
    return {
      spSculptureId: { type: String },
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
      color: [255, 0, 0, 0.75],
      xOffset: 4,
      yOffset: 7,
      blurRadius: 5
    }

    this.color2 = {
      color: [24, 255, 0, 0.75],
      xOffset: 0,
      yOffset: 0,
      blurRadius: 25
    }

    this.color3 = {
      color: [0, 24, 255, 0.75],
      xOffset: -3,
      yOffset: 3,
      blurRadius: 7
    }

    this.params = {
      color2: [24, 255, 0, 0.75],
      color3: [0, 24, 255, 0.75],
      blur: 10,
      contrast: 500,
      invert: 100,
      fontSize: 200,
      letterSpacing: -2,
      opacity: 1,
      textAlign: 'center',
      text: 'LAS',
      mouseMovementSpeed: 20,
      downloadSVG: () => this.downloadSVG.bind(this)
    }


    this.gui = new dat.GUI();
    this.gui.remember(this.params);
    this.gui.remember(this.color1);
    this.gui.remember(this.color2);
    this.gui.remember(this.color3);
    let el = (this.gui.domElement.style.display = 'none');
    document.querySelector('.dg').style.zIndex = 999;
    window.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);

    let color1 = this.gui.addFolder('Color 1');
    this.initColorUI(color1, this.color1);

    let color2 = this.gui.addFolder('Color 2');
    this.initColorUI(color2, this.color2);

    let color3 = this.gui.addFolder('Color 3');
    this.initColorUI(color3, this.color3);
    
    this.gui.add(this.params, 'blur', 0, 20)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'contrast', 0, 1000)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'invert', 0, 100)
      .onChange(() => this.requestUpdate());

    this.gui.add(this.params, 'opacity', 0.0, 1.0)
      .onChange(() => this.requestUpdate());

    this.gui.add(this.params, 'fontSize', 0, 1000)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'letterSpacing', -100, 100)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'textAlign', ['left', 'center', 'right', 'justify'])
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'text')
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'mouseMovementSpeed', 1, 100);
    this.gui.add(this.params, 'downloadSVG');
  }

  initColorUI(folder, param) {
    folder.addColor(param, 'color')
      .onChange(() => this.requestUpdate());
    folder.add(param, 'xOffset', -100, 100)
      .onChange(() => this.requestUpdate());
    folder.add(param, 'yOffset', -100, 100)
      .onChange(() => this.requestUpdate());
    folder.add(param, 'blurRadius', 0, 100)
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
          -webkit-filter: invert(${this.params.invert}%) contrast(${this.params.contrast}%);
          filter: invert(${this.params.invert}%) contrast(${this.params.contrast}%);
        }

        .las-text{
            font-family: 'Helvetica neue', 'Arial', sans-serif;
            color: #fff;
            width: 100%;
            font-weight: bold;
            font-size: ${this.params.fontSize}px;
            text-align: ${this.params.textAlign};
            letter-spacing: ${this.params.letterSpacing}px;
            display: block;
            -webkit-filter: blur(${this.params.blur}px);
            filter: blur(${this.params.blur}px);
            text-shadow: ${this.color1.xOffset - this.mouse.x}px ${this.color1.yOffset - this.mouse.y}px ${this.color1.blurRadius}px rgba(${this.color1.color[0]}, ${this.color1.color[1]}, ${this.color1.color[2]}, ${this.color1.color[3]}), 
                         ${this.color2.xOffset - this.mouse.x}px ${this.color2.yOffset - this.mouse.y}px ${this.color2.blurRadius}px rgba(${this.color2.color[0]}, ${this.color2.color[1]}, ${this.color2.color[2]}, ${this.color2.color[3]}), 
                         ${this.color3.xOffset - this.mouse.x}px ${this.color3.yOffset - this.mouse.y}px ${this.color3.blurRadius}px rgba(${this.color3.color[0]}, ${this.color3.color[1]}, ${this.color3.color[2]}, ${this.color3.color[3]});
                         
        }
      </style>
      <div id="text-container" class="container">
        <div class="las-text">${this.params.text}</div>
        
      </div>
    `;
  }

  downloadSVG() {
    domtoimage.toBlob(document.getElementById('text-container'))
      .then(function (blob) {
        window.saveAs(blob, `${this.params.text}.png`);
      });

    // domtoimage.toSvg(document.getElementById('my-node'), { filter: (node) => node.tagName !== 'i' })
    //   .then((dataUrl) => {
        
    //   });
  }

  /**
   * Implement firstUpdated to perform one-time work on first update:
   * - Call a method to load the lazy element if necessary
   * - Focus the checkbox
   */
  firstUpdated() {
    // console.log('loaded');
  }

  onDocumentMouseMove(event) {
    event.preventDefault();
    this.mouse.x = (((event.clientX - 0.5) / window.innerWidth) * 2 - 1) * this.params.mouseMovementSpeed ;
    this.mouse.y = -(- ((event.clientY - 0.5) / window.innerHeight) * 2 + 1) * this.params.mouseMovementSpeed;
    this.requestUpdate();
  }

}

// Register the element with the browser
customElements.define('las-renderer', StartLitElement);
