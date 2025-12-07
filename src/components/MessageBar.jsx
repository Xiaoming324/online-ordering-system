function MessageBar({ message, globalError, onClear }) {
  if (!message && !globalError) {
    return null;
  }

  const text = globalError || (message && message.text);
  const type = globalError ? 'error' : message.type;

  let className = 'message-bar';
  if (type === 'success') {
    className += ' message-bar--success';
  } else if (type === 'error') {
    className += ' message-bar--error';
  } else {
    className += ' message-bar--info';
  }

  return (
    <div className={className}>
      <span className="message-bar__text">{text}</span>
      <button
        type="button"
        className="message-bar__close"
        onClick={onClear}
      >
        ×
      </button>
    </div>
  );
}

export default MessageBar;