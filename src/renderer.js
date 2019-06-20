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
      params: {type: Object}
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
    this.params = {
      color1 : [255, 0, 0, 0.75],
      color1XOffset: 4,
      color1YOffset: 7,
      color1BlurRadius: 5,
      color2: [24, 255, 0, 0.75],
      color3: [0, 24, 255, 0.75],
      blur: 10,
      contrast: 500,
      invert: 100

    }
    this.gui = new dat.GUI();
    this.gui.addColor(this.params, 'color1')
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'color1XOffset', -20, 20)
      .onChange(() => this.requestUpdate());
    this.gui.addColor(this.params, 'color2')
      .onChange(() => this.requestUpdate());
    this.gui.addColor(this.params, 'color3')
      .onChange(() => this.requestUpdate());
    
    this.gui.add(this.params, 'blur', 0, 20)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'contrast', 0, 1000)
      .onChange(() => this.requestUpdate());
    this.gui.add(this.params, 'invert', 0, 100)
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
          justify-content: center;
          -webkit-box-align: center;
          -webkit-align-items: center;
          -ms-flex-align: center;
          align-items: center;
          background-color: #000;
          -webkit-filter: invert(${this.params.invert}%) contrast(${this.params.contrast}%);
          filter: invert(${this.params.invert}%) contrast(${this.params.contrast}%);
        }

        .las-text{
            font-family: 'Helvetica neue', 'Arial', sans-serif;
            color: #fff;
            font-size: 200px;
            text-align: center;
            letter-spacing: -2px;
            display: block;
            -webkit-filter: blur(${this.params.blur}px);
            filter: blur(${this.params.blur}px);
            text-shadow: ${this.params.color1XOffset}px 7px 5px rgba(${this.params.color1[0]}, ${this.params.color1[1]}, ${this.params.color1[2]}, ${this.params.color1[3]}), 
                          0 0 25px rgba(${this.params.color2[0]}, ${this.params.color2[1]}, ${this.params.color2[2]}, ${this.params.color2[3]}),
                           -3px 3px 7px rgba(${this.params.color3[0]}, ${this.params.color3[1]}, ${this.params.color3[2]}, ${this.params.color3[3]});
        }
      </style>
      <div class="container">
        <div class="las-text" value="LAS">LAS</div>
      </div>
    `;
  }

  /**
   * Implement firstUpdated to perform one-time work on first update:
   * - Call a method to load the lazy element if necessary
   * - Focus the checkbox
   */
  firstUpdated() {
    console.log('loaded');
    
  }

  

}

// Register the element with the browser
customElements.define('las-renderer', StartLitElement);
