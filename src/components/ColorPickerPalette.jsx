import React from "react";

class ColorPickerPalette extends React.Component {
  /**
   * Component constructor.
   */
  constructor() {
    super();
    this.drawingContext = null;
    this.styles = {
      previewColorCanvas: {
        width: null,
        height: null
      },
      previewColorHovered: {
        backgroundColor: "#ffffff"
      },
      previewColorSelected: {
        backgroundColor: "#ffffff"
      },
      marker: {
        width: null,
        height: null
      }
    };
    this.state = {
      selectedColor: {
        rgb: {
          r: 0,
          g: 0,
          b: 0
        },
        hex: "#ffffff"
      },
      hoveredColor: {
        rgb: {
          r: 0,
          g: 0,
          b: 0
        },
        hex: "#ffffff"
      }
    };
  }

  /**
   * Get palette context.
   */
  getDrawingContex() {
    this.drawingContext = this.refs.previewColorCanvas.getContext("2d");
  }

  /**
   * Convert an RGB component to a HEX value.
   */
  componentToHex(color) {
    var hex = color.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  /**
   * Convert RGB components to HEX value.
   */
  rgbToHex(r, g, b) {
    return `#${this.componentToHex(r)}${this.componentToHex(
      g
    )}${this.componentToHex(b)}`;
  }

  /**
   * Create color palette.
   * Draw base color and luminosity gradients.
   */
  createColorPalette() {
    let gradient = this.drawingContext.createLinearGradient(
      0,
      0,
      this.styles.previewColorCanvas.width,
      0
    );
    gradient.addColorStop(0, "rgb(255, 0, 0)");
    gradient.addColorStop(0.15, "rgb(255, 0, 255)");
    gradient.addColorStop(0.33, "rgb(0, 0, 255)");
    gradient.addColorStop(0.49, "rgb(0, 255, 255)");
    gradient.addColorStop(0.67, "rgb(0, 255, 0)");
    gradient.addColorStop(0.84, "rgb(255, 255, 0)");
    gradient.addColorStop(1, "rgb(255, 0, 0)");
    this.drawingContext.fillStyle = gradient;
    this.drawingContext.fillRect(
      0,
      0,
      this.drawingContext.canvas.width,
      this.styles.previewColorCanvas.height
    );
    gradient = this.drawingContext.createLinearGradient(
      0,
      0,
      0,
      this.styles.previewColorCanvas.height
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    this.drawingContext.fillStyle = gradient;
    this.drawingContext.fillRect(
      0,
      0,
      this.drawingContext.canvas.width,
      this.styles.previewColorCanvas.height
    );
  }

  /**
   * Detect mose move on color palette.
   * Palette event handler for mouse move.
   */
  handlePaletteMouseMove(event) {
    this.selectColor(event);
  }

  /**
   * Get color from mouse coordinates.
   */
  selectColor(event) {
    let canvasRect = this.drawingContext.canvas.getBoundingClientRect(),
      imageData;
    this.colorEventX = event.pageX - canvasRect.left;
    this.colorEventY = event.pageY - canvasRect.top;
    imageData = this.drawingContext.getImageData(
      this.colorEventX,
      this.colorEventY,
      1,
      1
    );
    this.setState({
      hoveredColor: {
        rgb: {
          r: imageData.data[0],
          g: imageData.data[1],
          b: imageData.data[2]
        },
        hex: this.rgbToHex(
          this.state.hoveredColor.rgb.r,
          this.state.hoveredColor.rgb.g,
          this.state.hoveredColor.rgb.b
        )
      }
    });
  }

  /**
   * Select all ranges of text for the selected input field.
   * Inputs event handler for mouse click.
   */
  handlePaletteMouseClick(event) {
    this.setState(
      {
        selectedColor: this.state.hoveredColor
      },
      this.props.setObjColor(this.state.hoveredColor.hex)
    );
    this.setMarketPosition(event);
  }

  /**
   * Set marker position for selected color on a color palette.
   */
  setMarketPosition(event) {
    let rect = this.refs.colorPicker.getBoundingClientRect();
    this.refs.previewColorMarker.style.left =
      event.pageX - rect.left - this.styles.marker.width / 2 + "px";
    this.refs.previewColorMarker.style.top =
      event.pageY - rect.top - this.styles.marker.height / 2 + "px";
  }

  /**
   * Get dimensions for palette.
   */
  handleInputMouseClick(event) {
    let target = event.currentTarget,
      value = target.value;
    target.setSelectionRange(0, value.length);

    this.saveToClipboard(value);
  }

  /**
   * Save selected color value to clipboard.
   */
  saveToClipboard(value) {
    try {
      var successful = document.execCommand("copy");
      if (successful) {
        console.log(value);
      } else {
        console.warn("Unable to copy.");
      }
    } catch (err) {
      console.warn("Unsupported Browser.");
    }
  }

  /**
   * Get dimensions for palette.
   */
  getDimensionsPalette() {
    var canvas = this.refs.previewColorCanvas.getBoundingClientRect();
    this.styles.previewColorCanvas.width = canvas.width;
    this.styles.previewColorCanvas.height = canvas.height;
  }

  /**
   * Get dimensions for marker.
   */
  getDimensionsMarker() {
    var rect = this.refs.previewColorMarker.getBoundingClientRect();
    this.styles.marker.width = rect.width;
    this.styles.marker.height = rect.height;
  }

  /**
   * Logic for palette.
   */
  logic() {
    this.getDimensionsPalette();
    this.getDimensionsMarker();
    this.getDrawingContex();
    this.createColorPalette();
  }

  /**
   * Execute logic at first render only.
   */
  componentDidMount() {
    this.logic();
  }

  /**
   * Render component.
   */
  render() {
    let id = this.props.id,
      colorPickerId = `colopicker-${id}`,
      previewColorMarkerId = `preview-color-marker-${id}`,
      previewColorCanvasId = `preview-color-canvas-${id}`,
      previewColorHexId = `preview-color-hex--${id}`,
      previewColorHoveredId = `preview-color-rgb-${id}`,
      previewColorSelectedId = `preview-color-hovered-${id}`,
      rgbTxt = `rgb(${this.state.hoveredColor.rgb.r}, ${this.state.hoveredColor.rgb.b}, ${this.state.hoveredColor.rgb.b})`,
      hexTxt = this.state.hoveredColor.hex,
      previewColorHoveredStyles = {
        backgroundColor: this.state.hoveredColor.hex
      },
      previewColorSelectedStyles = {
        backgroundColor: this.state.selectedColor.hex
      };
    return (
      <div ref="colorPicker" id={colorPickerId} className="colorPickerPalette">
        <div
          ref="previewColorMarker"
          id={previewColorMarkerId}
          className="colorPickerPalette--previewColorMarker"
        ></div>
        <canvas
          ref="previewColorCanvas"
          id={previewColorCanvasId}
          className="colorPickerPalette--previewColorCanvas"
          onMouseMove={this.handlePaletteMouseMove.bind(this)}
          onClick={this.handlePaletteMouseClick.bind(this)}
        ></canvas>
        <div
          ref="previewColorHovered"
          id={previewColorHoveredId}
          style={previewColorHoveredStyles}
          className="colorPickerPalette--previewColorHovered"
        ></div>
        <div
          ref="previewColorSelected"
          id={previewColorSelectedId}
          style={previewColorSelectedStyles}
          className="colorPickerPalette--previewColorSelected"
        ></div>
      </div>
    );
  }
}

export default ColorPickerPalette;
