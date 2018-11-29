import React, { Component } from 'react';

import {
	View,
  Platform,
	TouchableNativeFeedback,
	TouchableHighlight
} from 'react-native';

export default class Touchable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (Platform.OS === 'android') {
      return (
        <TouchableNativeFeedback disabled={(typeof this.props.disabled == 'boolean' ? this.props.disabled:false)} onPress={(evt) => {
            if (this.props.onPress) {
              this.props.onPress(evt);
            }
          }}
          onLayout={(...evt) => {
            if (this.props.onLayout) {
              this.props.onLayout(...evt);
            }
          }}>
          <View style={this.props.style}>
            {this.props.children}
          </View>
        </TouchableNativeFeedback>
      )
    }
    else {
      return (
        <TouchableHighlight underlayColor={this.props.underlayColor ? this.props.underlayColor : "transparent"} disabled={(typeof this.props.disabled == 'boolean' ? this.props.disabled:false)}
          style={this.props.style} onPress={(evt) => {
            if (this.props.onPress) {
              this.props.onPress(evt);
            }
          }}
          onLayout={(...evt) => {
            if (this.props.onLayout) {
              this.props.onLayout(...evt);
            }
          }}>
          {this.props.children}
        </TouchableHighlight>
      )
    }
  }
}
