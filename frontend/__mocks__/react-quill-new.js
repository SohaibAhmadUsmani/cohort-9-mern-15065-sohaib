const React = require('react');
module.exports = React.forwardRef(function ReactQuill(props, ref) {
  return React.createElement('div', { ref, 'data-testid': 'react-quill', ...props });
});
module.exports.quill = { getEditor: () => ({ root: { innerHTML: '' } }) };
