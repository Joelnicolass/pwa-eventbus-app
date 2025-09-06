import { StyleSheet } from 'react-native';

export const loaderStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  textContainer: {
    marginBottom: 10,
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
    letterSpacing: 1,
  },
});
