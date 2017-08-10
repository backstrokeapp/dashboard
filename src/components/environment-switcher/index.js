import * as React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './styles.css';

export default class EnvironmentSwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: window.localStorage.environmentSwitcher ? JSON.parse(window.localStorage.environmentSwitcher) : [],
      open: false,
    };

    // Listen for a keypress to open the environment switcher.
    const keys = this.props.keys || ['!', '!', '`'];
    let indexInKeys = 0;
    window.addEventListener('keydown', e => {
      if (keys[indexInKeys] === e.key) {
        if (indexInKeys === keys.length - 1) {
          indexInKeys = 0;
          this.setState({open: true});
        }
        indexInKeys++;
      } else {
        // Wasn't the right key, do nothing.
        indexInKeys = 0;
      }
      // Reset after a couple seconds
      setTimeout(() => { indexInKeys = 0; }, 3000);
    });

    // Set initial values for each environment
    const values = {};
    props.fields.forEach(f => {
      values[f.slug] = this.state.values[f.slug] || f.defaults[f.default];
    });
    this.props.onChange(values);
  }
  render() {
    if (!this.state.open) {
      return null;
    }

    const {fields} = this.props;
    return <div className="environment-switcher">
      <ul className="environment-switcher-items">
        {fields.map(field => {
          return <li key={field.slug} className="environment-switcher-item">
            <label htmlFor={`environment-switcher-${field.slug}`}>{field.name}</label>
            <Select
              value={this.state.values[field.slug]}
              onChange={e => this.setState({values: {...this.state.values, [field.slug]: e.value}})}
              options={Object.keys(field.defaults).map(f => ({
                value: field.defaults[f],
                label: `${f} (${field.defaults[f]})`,
              }))}
              className="environment-switcher-input"
            />
          </li>;
        })}
      </ul>

      <div className="environment-switcher-footer">
        <button className="environment-switcher-button" onClick={() => {
          this.setState({open: false});
          window.localStorage.environmentSwitcher = JSON.stringify(this.state.values);
          this.props.onChange(this.state.values)
        }}>OK</button>
      </div>

      <div className="environment-switcher-backdrop"></div>
    </div>;
  }
}
