import React, { Component } from 'react'
import ReactCrop from 'react-image-crop'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'
import axios from 'axios'
import _ from 'lodash'
import $ from 'jquery'

const imageType = /^image\//
const crop = {
  aspect: 16/9
}


var FileUpload = React.createClass({

  handleFile: function(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    if (!file) return;

    reader.onload = function(img) {
      ReactDom.findDOMNode(this.refs.in).value = '';
      this.props.handleFileChange(img.target.result);
    }.bind(this);
    reader.readAsDataURL(file);
  },

  render: function() {
    return (
      <input ref="in" type="file" accept="image/*" onChange={this.handleFile} />
    );
  }
});

class Dashboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      target: '',
      img: null,
      showCrop: false,
    }

    this.onDrop.bind(this)
  }

  componentDidMount() {
    const fileInput = document.querySelector('#file-picker')
    const self = this
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files.item(0);
      self.setState({
        img: file
      })

      if (!file || !imageType.test(file.type)) {
        return;
      }

      const reader = new FileReader();

      reader.onload = function(e) {
        self.setState({
          target: e.target.result,
          img: e.target.result
        })
        // this.state.target = e.target.result
        // loadEditView(e.target.result);
      };

      reader.readAsDataURL(file);
    });
  }

  onDrop(files) {
    const data = new FormData()
    _.each(files, (file, i) => {
      data.append(`file-${i}`, file)
    })
    $.ajax({
      url: 'http://localhost:6969/upload',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data){
        console.log(data);
        let list = ''
        data.forEach(link => {
          list += `<li><img src="${link}" height="150px" /></li>`
        })
        $('.uploaded-images').html(list)
      },
      error: function(err) {
        console.log('error: ', err);
      }
    });
  }

  showButton(crop) {
    document.querySelector('#photo-crop > button').style.display = 'block'
    console.log('finished crop!!', crop)
    this.crop = crop
  }

  submitCroppedImage() {
    const fileInput = document.querySelector('#file-picker')
    const image = fileInput.files[0]
    const cropString = JSON.stringify(this.crop)
    const data = new FormData()
    data.append('image', image)
    data.append('crop', this.crop)
    console.log('cropped image: ', this.crop, image)
    $.ajax({
      url: 'http://localhost:6969/upload',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      headers: {
        "crop": cropString
      },
      success: function(data) {
        console.log('got image! ', data)
        let image = `<li><img src="${data[0]}" /></li>`
        $('.uploaded-images').html(image)
      },
      error: function(err) {
        console.log('error uploading cropped image: ', err)
      }
    })
  }

  setImageReference(crop, image) {
    this.image = image
  }

  handleCrop() {
    console.log('handle crop..')
  }

  handleRequestHide() {
    console.log('handleRequestHide..')
  }

  handleFileChange(dataURI) {
    this.setState({
      img: dataURI,
      croppedImg: this.state.croppedImg,
      cropperOpen: true
    });
  }

  render() {
    return (
      <main className='dashboard'>
        <h2>Dashboard</h2>
        <h4>No Sidebar here</h4>
        <br/>
        <p>
          This drop zone is for photo upload to Amazon S3.
          It needs the server to be running to test out.
          Run 'npm run dev' if you want to test out the server and photo upload
        </p>

        <Dropzone onDrop={this.onDrop}>
          <p>Drop a file here or click to select files to upload</p>
        </Dropzone>

        <input type="file" id="file-picker" accept="image/*" onChange={() => this.setState({ showCrop: true, cropperOpen: true })} />

        {!this.state.showCrop ? '' : (
          <div id="photo-crop">
            <ReactCrop src={this.state.target} onImageLoaded={this.setImageReference.bind(this)} crop={crop} onComplete={this.showButton.bind(this)} /><br />
            <button style={{ display: 'none' }} className="btn btn-primary" onClick={this.submitCroppedImage.bind(this)}>Submit Cropped Image</button>
          </div>
        )}

        <hr />

        <p>
          Photos will render here once successfully uploaded to Amazon S3
        </p>

        <ul className="uploaded-images">
        </ul>
      </main>
    )
  }
}

export default connect()(Dashboard)