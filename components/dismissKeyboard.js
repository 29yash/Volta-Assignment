import {
	Keyboard
} from 'react-native';

var dismissKeyboard = (function(){
	let keyBoardShown = false;
	let _keyboardDidShow = () => {
		keyBoardShown = true;
	};

	let _keyboardDidHide = () => {
		keyBoardShown = false;
	};

	Keyboard.addListener('keyboardDidShow', _keyboardDidShow.bind(this));
	Keyboard.addListener('keyboardDidHide', _keyboardDidHide.bind(this));
	return  () => {
		if (keyBoardShown) {
			Keyboard.dismiss();
		}
	};
})();

module.exports = dismissKeyboard;