import React, { Component } from "react";
import Konva from "konva";
import Draggable from 'react-draggable';
import { Stage, Layer } from "react-konva";
import { CirclePicker } from 'react-color'
import ColorPickerPalette from 'components/ColorPickerPalette'
import { DropImage } from "components/DropImage";
import uuidv1 from 'uuid/v1';
import KeyboardEventHandler from "react-keyboard-event-handler";
import {
  Retangulo,
  Triangulo,
  Texto,
  Circulo,
  Imagem,
  Background,
} from "components/Formas";
import "./Editor.css";

// imagens
import Bold from "assets/icons-editor-bar/bold.png";
import Italic from "assets/icons-editor-bar/italics.png";
import Circle from "assets/icons-editor-bar/circle.png";
import Rectangle from "assets/icons-editor-bar/rectangle.png";
import FillColor from "assets/icons-editor-bar/fill-color.png";
import InsertText from "assets/icons-editor-bar/insert-text.png";
import Image from "assets/icons-editor-bar/image.png";
import Duplicate from "assets/icons-editor-bar/duplicate.png";
import Triangule from "assets/icons-editor-bar/triangule.png";
import Front from "assets/icons-editor-bar/front.png";
import Desfazer from "assets/icons-editor-bar/desfazer.png";
import Refazer from "assets/icons-editor-bar/refazer.png";
import Save from "assets/icons-editor-bar/save.png";
import Back from "assets/icons-editor-bar/back.png";
import Underline from "assets/icons-editor-bar/underline.png";
import ZoomIn from "assets/icons-editor-bar/zoom-in.png";
import ZoomOut from "assets/icons-editor-bar/zoom-out.png";
import BackgroundIcon from "assets/icons-editor-bar/background.png";

var HISTORY = []

var POSITION = 0

function saveHistory(history) {
  var remove = (HISTORY.length - 1) - POSITION;
  HISTORY = HISTORY.slice(0, HISTORY.length - remove);
  HISTORY.push(history.slice(0))
  POSITION = HISTORY.length - 1
}

function revertHistory() {
  return HISTORY[POSITION]
}

const Btn = props => {
  return (
    <div className="proximo-btn" onClick={props.onClick}>
      {props.title}
    </div >
  )
}

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.stageRef = React.createRef();
    this.containerCanvas = React.createRef();
  }
  state = {
    arrayObjectsLayer: [],
    kanvasWidth: 18.9,
    kanvasHeight: 10,
    widthKanvas: 1600,
    heightKanvas: 800,
    showPallet: false,
    selectedObject: {},
    showBackground: false,
    backgroundOn: true,
    indexTextSelected: 0,
    zoom: 2,
    imgBase64: undefined,
    newTextObj: {
      textEditVisible: false,
      fill: "black",
      textX: 0,
      textY: 0,
      textYTextArea: 0,
      textXTextArea: 0,
      textValue: "Two clicks to edit",
      fontSize: 28,
      width: 250,
      y: 100,
      x: 100,
      height: 150,
      fontStyle: "normal",
      align: "left",
      id: 0,
      type: 'text',
    },
    newCircleObj: {
      y: 100,
      x: 100,
      radius: 50,
      fill: "#637EF7",
      id: 0,
      type: 'circle',
    },
    newImageObj: {
      x: 100,
      image: null,
      id: 50,
      type: 'image',
    },
    newSquareObj: {
      y: 100,
      x: 100,
      width: 100,
      height: 50,
      fill: "#637EF7",
      id: 0,
      type: 'square',
    },
    newTriangleObj: {
      y: 100,
      x: 100,
      sides: 3,
      radius: 80,
      fill: "#637EF7",
      id: 0,
      type: 'triangule',
    },
    // state draggable stuff
    activeDrags: 0,
    deltaPosition: {
      x: 0, y: 0
    },
    controlledPosition: {
      x: -400, y: 200
    }
  };

  handleDragStart = e => {
    e.target.setAttrs({
      shadowOffset: {
        x: 15,
        y: 15
      },
      scaleX: 1.1,
      scaleY: 1.1
    });
  };

  handleDragEnd = e => {
    e.target.to({
      duration: 0.5,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: 1,
      scaleY: 1,
      shadowOffsetX: 5,
      shadowOffsetY: 5
    });
  };

  saveEverything = async () => {
    await localStorage.setItem("stateSaved", JSON.stringify(this.state));
  };

  deleteSavedState = async () => {
    await localStorage.removeItem("stateSaved");
    const state = await localStorage.getItem("defaultState");
    if (state) this.setState(JSON.parse(state));
  };


  async componentDidMount() {
    saveHistory(this.state.arrayObjectsLayer)
    await localStorage.setItem("defaultState", JSON.stringify(this.state));
    const state = await localStorage.getItem("stateSaved");
    if (state) this.setState(JSON.parse(state))
    else this.setState({ selectedObject: this.state.arrayObjectsLayer[0] })

  }

  handleTextDblClick = (e, index) => {
    const absPos = e.target.getAbsolutePosition();
    const stageBox = this.stageRef.current.container().getBoundingClientRect();
    let { arrayObjectsLayer, widthKanvas } = this.state;
    for (let i; i < arrayObjectsLayer.length; i++) {
      arrayObjectsLayer[i].textEditVisible = false;
    }
    arrayObjectsLayer[index].textEditVisible = true;
    arrayObjectsLayer[index].textXTextArea =
      (stageBox.left + absPos.x + this.containerCanvas.current.scrollLeft) / this.state.zoom;
    arrayObjectsLayer[index].textYTextArea =
      stageBox.bottom + absPos.y - stageBox.height + 40 + this.containerCanvas.current.scrollTop;
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
    });
  };

  handleSelect = index => {
    this.setState({
      indexTextSelected: index
    });
  };

  changeStyle = style => {
    let { arrayObjectsLayer, indexTextSelected } = this.state;
    if (arrayObjectsLayer[indexTextSelected])
      arrayObjectsLayer[indexTextSelected].fontStyle = style;
    saveHistory(arrayObjectsLayer)
    this.setState({
      arrayObjectsLayer,
    });
  };

  setUnderline = underline => {
    let { arrayObjectsLayer, indexTextSelected } = this.state;
    if (arrayObjectsLayer[indexTextSelected])
      arrayObjectsLayer[indexTextSelected].textDecoration = underline;
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
    });
  };

  changeFontSize = event => {
    let { arrayObjectsLayer, indexTextSelected } = this.state;
    arrayObjectsLayer[indexTextSelected].fontSize = parseInt(event.target.value);

    saveHistory(arrayObjectsLayer)
    this.setState({
      arrayObjectsLayer,
    });
  };

  handleTextEdit = (e, index) => {
    let { arrayObjectsLayer } = this.state;
    arrayObjectsLayer[index].textValue = e.target.value;
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
    });
  };

  trazerItem = (front) => {
    let { arrayObjectsLayer, selectedObject } = this.state;
    if (this.state.selectedObject) {
      front ?
        arrayObjectsLayer.push(
          arrayObjectsLayer.splice(
            arrayObjectsLayer.findIndex(
              elt => elt.id === selectedObject.id),
            1)[0]
        )
        : arrayObjectsLayer.unshift(
          arrayObjectsLayer.splice(
            arrayObjectsLayer.findIndex(
              elt => elt.id === selectedObject.id),
            1)[0]
        )
      saveHistory(arrayObjectsLayer)

      this.setState({
        arrayObjectsLayer,
      });
    }
  }

  addNewText = () => {
    let { arrayObjectsLayer, newTextObj } = this.state;
    newTextObj.id = Math.round(Math.random() * 10000);
    arrayObjectsLayer.push(newTextObj);
    let selectedObject = newTextObj;
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer, selectedObject,
    });
  };

  addNewSquare = () => {
    let { arrayObjectsLayer } = this.state;
    let newSquareObj = Object.assign({}, this.state.newSquareObj);
    newSquareObj.id = Math.round(Math.random() * 10000);
    let selectedObject = newSquareObj;
    arrayObjectsLayer.push(newSquareObj);
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
      selectedObject
    });
  };

  addNewTriangle = () => {
    let { arrayObjectsLayer } = this.state;
    let newTriangleObj = Object.assign({}, this.state.newTriangleObj);
    arrayObjectsLayer.id = Math.round(Math.random() * 10000);
    let selectedObject = newTriangleObj;
    arrayObjectsLayer.push(newTriangleObj);
    saveHistory(arrayObjectsLayer)
    this.setState({
      arrayObjectsLayer,
      selectedObject
    });
  };

  addNewCircle = () => {
    let { arrayObjectsLayer } = this.state;
    let newCircleObj = Object.assign({}, this.state.newCircleObj);
    newCircleObj.id = Math.round(Math.random() * 10000);
    let selectedObject = newCircleObj;
    arrayObjectsLayer.push(newCircleObj);
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
      selectedObject
    });
  };

  addNewImage = image => {
    let { arrayObjectsLayer, newImageObj } = this.state;
    newImageObj.id = Math.round(Math.random() * 10000);
    newImageObj.image = image;
    arrayObjectsLayer.push(newImageObj);
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
    });
  };

  tooglePallet = () => {
    if (this.state.selectedObject)
      this.setState({
        showPallet: !this.state.showPallet
      });
  };

  loadImage = base64 => {
    var image = new window.Image();
    image.src = `data:image/png;base64,${base64}`;
    image.addEventListener("load", this.addNewImage(image));
  };

  selectShape = (selectedObject, index = undefined) => {
    console.log('dentro')
    let { arrayObjectsLayer, indexTextSelected } = this.state;
    // fecha a text area do texto
    for (let i; i < arrayObjectsLayer.length; i++) {
      arrayObjectsLayer[i].textEditVisible = false;
    }
    if (index) {
      indexTextSelected = index - 1;
      arrayObjectsLayer[indexTextSelected].textEditVisible = false;
    } else {
      if (arrayObjectsLayer[indexTextSelected]) {
        arrayObjectsLayer[indexTextSelected].textEditVisible = false;
        indexTextSelected = undefined;
      }
    }
    this.setState({
      selectedObject,
      arrayObjectsLayer,
      indexTextSelected,
    });
  };

  desfazer = () => {
    POSITION = POSITION === 0 ? POSITION : POSITION - 1
    const history = revertHistory()
    this.setState({
      arrayObjectsLayer: history.slice(0),
    })
  }

  refazer = () => {
    POSITION = POSITION < HISTORY.length - 1 ? POSITION + 1 : POSITION
    const history = revertHistory()
    this.setState({
      arrayObjectsLayer: history.slice(0),
    })
  }

  setArrayObject = arrayObjectsLayer => {
    saveHistory(arrayObjectsLayer)

    this.setState({
      arrayObjectsLayer,
    });
  };

  zommStage(zoom) {
    if (!(zoom < 1) && !(zoom > 4)) {
      this.setState({
        zoom
      })
    }
  }

  duplicarObject = () => {
    let { arrayObjectsLayer, selectedObject } = this.state;
    if (selectedObject) {
      let copy = { ...selectedObject };
      copy.x = copy.x + 10
      copy.y = copy.y + 10
      copy.id = Math.round(Math.random() * 10000);
      selectedObject = { ...copy }
      arrayObjectsLayer.push(copy);
    }
    saveHistory(arrayObjectsLayer)
    this.setState({
      arrayObjectsLayer,
      selectedObject
    });
  };

  setObjColor = color => {
    let arrayObjectsLayer = this.state.arrayObjectsLayer;
    let selectedObject = { ...this.state.selectedObject };

    for (let i = 0; i < arrayObjectsLayer.length; i++) {
      if (selectedObject.id === arrayObjectsLayer[i].id) {
        if (typeof color === 'string') {
          arrayObjectsLayer[i].fill = color;
        } else {
          arrayObjectsLayer[i].fill = color.hex;
        }
      }
    }
    saveHistory(arrayObjectsLayer)

    this.setState({
      selectedObject,
      arrayObjectsLayer,
    });
  };

  deleteNodeSelected = () => {
    let { selectedObject, arrayObjectsLayer } = this.state
    if (arrayObjectsLayer.length > 0) {
      for (let i = 0; i < arrayObjectsLayer.length; i++) {
        if (arrayObjectsLayer[i].type === 'text') arrayObjectsLayer[i].textEditVisible = false;
        if (selectedObject.id === arrayObjectsLayer[i].id) {
          arrayObjectsLayer.splice(i, 1);
        }
      }
      saveHistory(arrayObjectsLayer)

      this.setState({
        arrayObjectsLayer,
      });
    }
  };

  b64toBlob = b64Data => {
    const contentType = 'image/png';
    const sliceSize = 512;
    let byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    this.savePng(blob)
  }
  imageToBlob = () => {
    const { zoom } = this.state
    this.setState({
      selectedObject: {},
      showBackground: true
    })
    setTimeout(() => {
      const base64Image = this.stageRef.current.getStage().toDataURL({
        pixelRatio: zoom // qualidade da imagem
      })
      // Split the base64 string in data and contentType
      const block = base64Image.split(";");
      // Get the content type of the image
      const contentType = block[0].split(":")[1];// In this case "image/gif"
      // get the real base64 content of the file
      const realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
      this.setState({
        showBackground: false
      })
      // Convert it to a blob to upload
      return this.b64toBlob(realData, contentType);
    }, 200);
  }

  savePng = async blob => {
    var formData = new FormData();
    formData.append('profile', 'display')
    formData.append('uuid', uuidv1())
    formData.append('filename', `${Math.floor(Math.random() * 1000)}.png`)
    formData.append('totalfilesize', blob.size)
    formData.append('file', blob)

    fetch(process.env.REACT_APP_IMAGE_UPLOAD, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(function (json) {
        if (json.success) {
          setTimeout(() => {
            window.open(json.files[0].url, "_blank")
          }, 500);
        }
      },
        error => {
          return error;
        }
      )
  }

  handleDrag = (e, ui) => {
    e.stopPropagation();
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  };


  // functions de arrastar o trem da cor
  onStart = () => {
    this.setState({ activeDrags: ++this.state.activeDrags });
  };

  onStop = () => {
    this.setState({ activeDrags: --this.state.activeDrags });
  };

  // For controlled component
  adjustXPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = this.state.controlledPosition;
    this.setState({ controlledPosition: { x: x - 10, y } });
  };

  adjustYPos = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { controlledPosition } = this.state;
    const { x, y } = controlledPosition;
    this.setState({ controlledPosition: { x, y: y - 10 } });
  };

  onControlledDrag = (e, position) => {
    const { x, y } = position;
    this.setState({ controlledPosition: { x, y } });
  };

  onControlledDragStop = (e, position) => {
    this.onControlledDrag(e, position);
    this.onStop();
  };

  backgroundToogle = () => {
    this.setState({
      backgroundOn: !this.state.backgroundOn
    })
  };

  // fim functions de arrastar o trem da cor

  render() {
    const {
      selectedObject,
      arrayObjectsLayer,
      indexTextSelected,
      showPallet,
      widthKanvas,
      heightKanvas,
      backgroundOn,
      showBackground,
      zoom
    } = this.state;
    const width = (widthKanvas) / zoom// cm to pixel
    const height = (heightKanvas) / zoom// cm to pixel

    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    return (
      <div>
        <div className="containerCanvas" ref={this.containerCanvas}>
          <div className="containerToolbar">
            <div
              className="containerIconeToolbar"
              onClick={this.imageToBlob}
            >
              <img className="img" src={Save} title="Save as png"></img>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={this.desfazer}
            >
              <img className="img" src={Desfazer} title="Desfazer"></img>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={this.refazer}
            >
              <img className="img" src={Refazer} title="Refazer"></img>
            </div>
            <div
              className="containerIconeToolbar"
            >
              <DropImage getImage={base64 => this.loadImage(base64)}>
                <img className="img" src={Image} title="Adicionar imagem" />
              </DropImage>
            </div>
            <div className="containerIconeToolbar" onClick={this.addNewCircle}>
              <img className="img" src={Circle} title="Circulo"></img>
            </div>
            <div className="containerIconeToolbar" onClick={this.addNewSquare}>
              <img className="img" src={Rectangle} title="Retangulo"></img>
            </div>
            <div className="containerIconeToolbar" onClick={this.addNewTriangle}>
              <img className="img" src={Triangule} title="Triangulo"></img>
            </div>
            <div className="containerIconeToolbar" onClick={this.addNewText}>
              <img className="img" src={InsertText} title="Criar texto"></img>
            </div>
            <div className="containerIconeToolbar">
              <div className="containerOpcao">
                {arrayObjectsLayer[indexTextSelected] ? (
                  <select
                    disabled={!arrayObjectsLayer[indexTextSelected]}
                    value={arrayObjectsLayer[indexTextSelected].fontSize}
                    onChange={this.changeFontSize}
                  >
                    {[...new Array(100)].map(
                      (i, index) =>
                        index > 5 && (
                          <option
                            key={index}
                            onClick={() => this.changeFontSize(`${index * zoom}px`)}
                            value={index}
                          >
                            {`${index}px`}
                          </option>
                        )
                    )}
                  </select>
                ) : (
                    <select
                      disabled={true}
                      value={28}
                      onChange={this.changeFontSize}
                    />
                  )}
              </div>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={() =>
                this.changeStyle(
                  arrayObjectsLayer[indexTextSelected] &&
                    arrayObjectsLayer[indexTextSelected].fontStyle == "bold"
                    ? "normal"
                    : "bold"
                )
              }
              style={
                arrayObjectsLayer[indexTextSelected] &&
                  arrayObjectsLayer[indexTextSelected].fontStyle == "bold"
                  ? { backgroundColor: "grey" }
                  : {}
              }
            >
              <img className="img" src={Bold} title="Negrito"></img>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={() =>
                this.changeStyle(
                  arrayObjectsLayer[indexTextSelected] &&
                    arrayObjectsLayer[indexTextSelected].fontStyle == "italic"
                    ? "normal"
                    : "italic"
                )
              }
              style={
                arrayObjectsLayer[indexTextSelected] &&
                  arrayObjectsLayer[indexTextSelected].fontStyle == "italic"
                  ? { backgroundColor: "grey" }
                  : {}
              }
            >
              <img className="img" src={Italic} title="Italico"></img>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={() =>
                this.setUnderline(
                  arrayObjectsLayer[indexTextSelected] &&
                    arrayObjectsLayer[indexTextSelected].textDecoration == "underline"
                    ? ""
                    : "underline"
                )
              }
              style={
                arrayObjectsLayer[indexTextSelected] &&
                  arrayObjectsLayer[indexTextSelected].textDecoration == "underline"
                  ? { backgroundColor: "grey" }
                  : {}
              }
            >
              <img className="img" src={Underline} title="Sublinhado"></img>
            </div>
            <div
              className="containerIconeToolbar"
              onClick={this.tooglePallet}
              style={showPallet ? { backgroundColor: "grey" } : {}}
            >
              <img className="img" src={FillColor} title="Cor"></img>
            </div>
            <div className="containerIconeToolbar" onClick={this.duplicarObject}>
              <img className="img" src={Duplicate} title="Duplicar"></img>
            </div>
            <div className="containerIconeToolbar" onClick={() => this.zommStage(zoom + 1)}>
              <img className="img" src={ZoomOut} title="Zoom -"></img>
            </div>
            <div className="containerIconeToolbar" onClick={() => this.zommStage(zoom - 1)}>
              <img className="img" src={ZoomIn} title="Zoom +"></img>
            </div>
            <div className="containerIconeToolbar" onClick={() => this.trazerItem(true)}>
              <img className="img" src={Front} title="Trazer elemento para frente"></img>
            </div>
            <div className="containerIconeToolbar" onClick={() => this.trazerItem()}>
              <img className="img" src={Back} title="Levar elemento para trás"></img>
            </div>
            <div className="containerIconeToolbar" onClick={() => this.backgroundToogle()}>
              <img className="img" src={BackgroundIcon} title="Background"
                style={
                  !backgroundOn ? { backgroundColor: "grey" }
                    : {}
                }></img>
            </div>
          </div>
          <div>
            {showPallet && (
              <div onClick={this.tooglePallet} className="containerColors">
                <Draggable onDrag={this.handleDrag} {...dragHandlers} >
                  <div className="containerColorPickerPalette" onClick={e => e.stopPropagation()}>
                    <ColorPickerPalette setObjColor={this.setObjColor} />
                    <div className="containerCirclePicker">
                      <CirclePicker color={selectedObject.fill} onChangeComplete={this.setObjColor} onChange={this.setObjColor} />
                    </div>
                    <div>
                    </div>
                  </div>
                </Draggable>
              </div>
            )}
            <div className={`container-area`}>
              <Stage
                scaleY={1 / zoom}
                scaleX={1 / zoom}
                ref={this.stageRef}
                width={width}
                height={height}
                onMouseDown={e => {
                  // deselect when clicked on empty area
                  console.log(e.target)
                  console.log(e.target.getStage())
                  const clickedOnEmpty = e.target === e.target.getStage();
                  if (clickedOnEmpty) {
                    this.selectShape(null);
                  }
                }}
              >
                <Layer>
                  {(showBackground && backgroundOn) && <Background width={5000} height={5000} />}
                  {
                    arrayObjectsLayer &&
                    arrayObjectsLayer.map((item, index) => {
                      return (
                        item.type === 'square' ?
                          <Retangulo
                            key={index}
                            shapeProps={item}
                            isSelected={
                              selectedObject && item.id === selectedObject.id
                            }
                            onSelect={() => {
                              this.selectShape(item);
                            }}
                            onChange={newAttrs => {
                              const item = arrayObjectsLayer.slice();
                              item[index] = newAttrs;
                              this.setArrayObject(item);
                            }}
                          />
                          :
                          item.type === 'triangule' ?
                            <Triangulo
                              key={index}
                              shapeProps={item}
                              isSelected={
                                selectedObject && item.id === selectedObject.id
                              }
                              onSelect={() => {
                                this.selectShape(item);
                              }}
                              onChange={newAttrs => {
                                const item = arrayObjectsLayer.slice();
                                item[index] = newAttrs;
                                this.setArrayObject(item);
                              }}
                            />
                            :
                            item.type === 'circle' ?
                              <Circulo
                                key={index}
                                shapeProps={item}
                                isSelected={
                                  selectedObject && item.id === selectedObject.id
                                }
                                onSelect={() => {
                                  this.selectShape(item);
                                }}
                                onChange={newAttrs => {
                                  const item = arrayObjectsLayer.slice();
                                  item[index] = newAttrs;
                                  this.setArrayObject(item);
                                }}
                              />
                              :
                              item.type === 'image' ?
                                <Imagem
                                  key={index}
                                  shapeProps={item}
                                  isSelected={
                                    selectedObject && item.id === selectedObject.id
                                  }
                                  onSelect={() => {
                                    this.selectShape(item);
                                  }}
                                  onChange={newAttrs => {
                                    const item = arrayObjectsLayer.slice();
                                    item[index] = newAttrs;
                                    this.setArrayObject(item);
                                  }}
                                />
                                :
                                item.type === 'text' ?
                                  <Texto
                                    key={index}
                                    onSelect={() => {
                                      this.selectShape(item, index + 1);
                                    }}
                                    shapeProps={item}
                                    isSelected={
                                      selectedObject && item.id === selectedObject.id
                                    }
                                    handleTextDblClick={e =>
                                      this.handleTextDblClick(e, index)
                                    }
                                    onChange={newAttrs => {
                                      const item = arrayObjectsLayer.slice();
                                      item[index] = newAttrs;
                                      this.setArrayObject(item);
                                    }}
                                  />
                                  :
                                  false
                      )
                    }
                    )
                  }
                </Layer>
              </Stage>
            </div>
            <div className="containerBtnExportar">
            </div>
            {arrayObjectsLayer &&
              arrayObjectsLayer.map((item, index) => {
                return item ? (
                  <textarea
                    key={index}
                    value={item.textValue}
                    style={{
                      display: item.textEditVisible ? "block" : "none",
                      position: "absolute",
                      top: item.textYTextArea + "px",
                      left: item.textXTextArea * zoom + "px",
                      width: item.width * (1 / zoom),
                      height: item.height * (1 / zoom),
                      fontSize: item.fontSize * (1 / zoom),
                      color: item.fill,
                      fontStyle: item.fontStyle,
                      fontWeight: item.fontStyle
                    }}
                    onChange={e => this.handleTextEdit(e, index)}
                  />
                ) : (
                    false
                  );
              })}
          </div>
          <KeyboardEventHandler
            handleKeys={["backspace", "delete"]}
            onKeyEvent={this.deleteNodeSelected}
          />
        </div>
      </div>
    );
  }
}

