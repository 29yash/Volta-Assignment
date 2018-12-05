import {NetInfo} from 'react-native';

export default class NetworkController {

  netstate = null;
  block = null;
  _myBind = null;
  isFirstTime = true;

  static controller = null;

  static getController() {
    if (!NetworkController.controller) {
      NetworkController.controller = new NetworkController;
    }
    return NetworkController.controller;
  }

  constructor() {
    this._myBind = this.handleFirstConnectivityChange.bind(this);
    NetInfo.isConnected.fetch().then((isConnected) => {
      this.netstate = isConnected;
      NetInfo.isConnected.addEventListener(
        'connectionChange',
        this._myBind
      );
      this.after();
    });
  }

  set callBack(newCallback) {
    this.block = newCallback;
  }

  removeCallback() {
    this.block = null;
  }

  handleFirstConnectivityChange(reach) {
    var oldState = this.netstate;
    this.netstate = reach;
		if (this.netstate && !oldState) {
			if (this.block) {
        this.block();
      }
		}
	}

  after () {
    setInterval(() => {
      NetInfo.isConnected.removeEventListener(
  		  'connectionChange',
  		  this._myBind
  		);
      setTimeout(() => {
        NetInfo.isConnected.addEventListener(
          'connectionChange',
          this._myBind
        );
      }, 100);
    }, 10000);
  }
}
