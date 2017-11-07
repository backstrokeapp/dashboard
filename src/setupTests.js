import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Setup enzyme to work with React 16.
configure({ adapter: new Adapter() });
