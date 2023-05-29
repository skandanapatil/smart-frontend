import React from 'react';
import './App.css';
//import ParticlesBg from 'particles-bg'
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import Imagelinkform from './Components/Imagelinkform/Imagelinkform';
import Rank from './Components/Rank/Rank';
import Facerecognition from './Components/Facerecognition/Facerecognition';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import 'tachyons';
const returnClarifaiRequestOptions =(imageUrl) =>{
  const PAT = '25b9adcbb0a5411190e35d0d58980790';
  const USER_ID = 'e2suchq624lv';       
  const APP_ID = 'test';
  const MODEL_ID = 'face-detection';  
  const IMAGE_URL = imageUrl;

 const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  const requestOptions= {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };
return requestOptions;
}
const initialState ={
  input:'',
  imageUrl:'',
  box:{},
  Route:'Signin',
  isSignedin:false,
  user:{
    id:'',
     name:'',
     email:'',
     password:'',
     entries:'',
     joined: '' 
  }
}
class App extends React.Component{
  constructor(){
    super();
    this.state=initialState;
  }
 loadUser =(data)=>{
  this.setState({
    user:{
      id:data.id,
      name:data.name,
      email:data.email,
      password:data.password,
      entries:data.entries,
      joined:data.joined
    }
  })
 }
  /*componentDidMount() {
    fetch('http://localhost:3000/')
    .then(response =>response.json())
    .then(console.log)
  }
  */
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }
  
  onInputChange=(event)=>{
    console.log(event.target.value);
   this.setState({input: event.target.value})
  }
  onButtonSubmit=()=>{
    console.log("click");
   this.setState({imageUrl:this.state.input})
   fetch("https://api.clarifai.com/v2/models/" + 'face-detection' + "/outputs", returnClarifaiRequestOptions(this.state.input))
     .then(response => {
       console.log('hi', response)
       if (response) {
         fetch('http://localhost:3000/image', {
           method: 'put',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
             id: this.state.user.id
           })
         })
           .then(response => response.json())
           .then(count => {
             this.setState(Object.assign(this.state.user, { entries: count}))
           })

       }
       this.displayFaceBox(this.calculateFaceLocation(response))
     })
    .catch(err => console.log(err));
    
  }
  onRouteChange=(route)=>{
    if (route==='signOut'){
      this.setState(initialState);
    }
    else if (route==='home'){
      this.setState({isSignedin:true})
    }
    this.setState({Route: route});
  }
  render(){
  return (
    <div>
      {/*particleBg('body');*/}
      <Navigation isSignedin={this.state.isSignedin}onRouteChange={this.onRouteChange}/>
      {this.state.Route==='home'?
      <div>
      <Logo/>
      <Rank name={this.state.user.name} entries={this.state.user.entries}/>
      <Imagelinkform onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
      <Facerecognition imageUrl={this.state.imageUrl} box={this.state.box}/>
      </div>:
      (
        this.state.Route ==='signin'?
        <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>:
        <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      )
      }
    </div>
  );
}
}

export default App;
