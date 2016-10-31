import ReactDOM from 'react-dom';

/**
* Browser Helper

*
* Provides helper methods for working with Browser behavior.
*
*/
const Browser = {

  /**
   * Get the current window
   *
   * @return window
   */
  getWindow: () => {
    return window;
  },

  /**
  * Redirect to URL
  *
  * @method redirectTo
  * @param url => URL string format
  */
  redirectTo: (url) => {
    Browser.getWindow().location = url;
  },

  /**
  * Reload the current page
  *
  * @method reload
  */
  reload: () => {
    Browser.getWindow().location.reload();
  },

  /**
  * Focuses and sets cursor of input field
  *
  * @method editFocus
  */
  editFocus: ((ref) => {
    let node = ReactDOM.findDOMNode(ref._input);
    node.focus();
    node.select();
  })
};

export default Browser;
