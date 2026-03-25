function ErrorState({ message }) {
  return (
    <div className="state-card error">
      <h3>Unable to load dashboard</h3>
      <p>{message}</p>
    </div>
  );
}

export default ErrorState;
