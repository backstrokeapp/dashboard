import * as React from 'react';
import classnames from 'classnames';
import './styles.css';

export default class LinkDetailWebhook extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }
  render() {
    const {link} = this.props;

    return <div className="link-detail-webhook">
      <div
        className={classnames('link-detail-webhook-header', {open: this.state.open})}
        onClick={() => this.setState({open: !this.state.open})}
      >
        Webhook link
        <span className="link-detail-webhook-header-arrow">&#9654;</span>
      </div>
      <div className={classnames('link-detail-webhook-body', {open: this.state.open})}>
        <p>
          Backstroke syncs your links every 10 minutes automatically. However, if you'd like to
          sync your links more often or you'd like to sync them on demand, you can make a
          HTTP request to this special url below to enqueue a manual link update.
        </p>
        <pre>https://api.backstroke.co/_{link.webhook}</pre>
      </div>
    </div>
  }
}
