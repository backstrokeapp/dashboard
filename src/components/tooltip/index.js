import * as React from 'react';
import classnames from 'classnames';
import './styles.css';

export default class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mouseInTooltip: false, mouseInChildren: false };
  }
  render() {
    const {label, children} = this.props;
    return <div className="tooltip-wrapper">
      <div
        className={classnames('tooltip', {
          hidden: !(this.state.mouseInChildren || this.state.mouseInTooltip),
        })}
        onMouseOver={() => this.setState({mouseInTooltip: true})}
        onMouseOut={() => this.setState({mouseInTooltip: false})}
      >{label || 'Untitled'}</div>
      <div
        className="tooltip-children"
        onMouseOver={() => this.setState({mouseInChildren: true})}
        onMouseOut={() => this.setState({mouseInChildren: false})}
      >{children}</div>
    </div>;
  }
}


// const Wrapped = TooltipHOC({label: 'Description for thing'})(MyComponent);
export function TooltipHOC({label}) {
  return Component => props => {
    return <Tooltip
      label={label}
      children={<Component {...props} />}
    />;
  };
}
