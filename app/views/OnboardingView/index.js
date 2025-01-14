import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { connect } from 'react-redux';
import { themes } from '../../constants/colors';
import Button from '../../containers/Button';
import FormContainer, { FormContainerInner } from '../../containers/FormContainer';
import I18n from '../../i18n';
import { getShowLoginButton } from '../../selectors/login';
import { withTheme } from '../../theme';
import { isTablet } from '../../utils/deviceInfo';
import ServerAvatar from "../WorkspaceView/ServerAvatar";
import styles from './styles';

class OnboardingView extends React.Component {
  static navigationOptions = {
    headerShown: false
  };

  static propTypes = {
    navigation: PropTypes.object,
    theme: PropTypes.string,
    Site_Name: PropTypes.string,
    Site_Url: PropTypes.string,
    server: PropTypes.string,
    Assets_favicon_512: PropTypes.object,
    registrationForm: PropTypes.string,
    registrationText: PropTypes.string,
    showLoginButton: PropTypes.bool,
    Accounts_iframe_enabled: PropTypes.bool,
    inviteLinkToken: PropTypes.string
  }

  get showRegistrationButton () {
    const { registrationForm, inviteLinkToken, Accounts_iframe_enabled } = this.props;
    return !Accounts_iframe_enabled && (registrationForm === 'Public' || (registrationForm === 'Secret URL' && inviteLinkToken?.length));
  }

  constructor(props) {
    super(props);
    if (!isTablet) {
      Orientation.lockToPortrait();
    }
  }

  login = () => {
    const {
      navigation, server, Site_Name, Accounts_iframe_enabled
    } = this.props;
    if (Accounts_iframe_enabled) {
      navigation.navigate('AuthenticationWebView', { url: server, authType: 'iframe' });
      return;
    }
    navigation.navigate('LoginView', { title: Site_Name });
  }

  register = () => {
    const { navigation, Site_Name } = this.props;
    navigation.navigate('RegisterView', { title: Site_Name });
  }

  renderRegisterDisabled = () => {
    const { Accounts_iframe_enabled, registrationText, theme } = this.props;
    if (Accounts_iframe_enabled) {
      return null;
    }

    return <Text style={[styles.registrationText, { color: themes[theme].auxiliaryText }]}>{registrationText}</Text>;
  }

  render () {
    const { theme, Site_Name, Assets_favicon_512, server, showLoginButton } = this.props;
    return (
      <FormContainer theme={theme} testID='onboarding-view'>
        <FormContainerInner>
          {/* <Image style={styles.onboarding} source={require('../../static/images/logo.png')} fadeDuration={0} /> */}
          <ServerAvatar theme={theme} url={server} image={Assets_favicon_512?.url ?? Assets_favicon_512?.defaultUrl} />
          <Text style={[styles.title, { color: themes[theme].titleText }]}>{I18n.t('Onboarding_title')}{Site_Name}</Text>
          <Text style={[styles.subtitle, { color: themes[theme].controlText }]}>{I18n.t('Onboarding_subtitle')}</Text>
          <Text style={[styles.description, { color: themes[theme].auxiliaryText }]}>{I18n.t('Onboarding_description')}</Text>
          <View style={styles.buttonsContainer}>
            {showLoginButton
              ? (
                <Button
                  title={I18n.t('Login')}
                  type='primary'
                  onPress={this.login}
                  theme={theme}
                  testID='workspace-view-login'
                />
              ) : null}
            {
              this.showRegistrationButton ? (
                <Button
                  title={I18n.t('Create_account')}
                  type='secondary'
                  backgroundColor={themes[theme].chatComponentBackground}
                  onPress={this.register}
                  theme={theme}
                  testID='workspace-view-register'
                />
              ) : this.renderRegisterDisabled()
            }
          </View>
        </FormContainerInner>
      </FormContainer>
    );
  }
}

const mapStateToProps = state => ({
  server: state.server.server,
  adding: state.server.adding,
  Site_Name: state.settings.Site_Name,
  Site_Url: state.settings.Site_Url,
  Assets_favicon_512: state.settings.Assets_favicon_512,
  registrationForm: state.settings.Accounts_RegistrationForm,
  registrationText: state.settings.Accounts_RegistrationForm_LinkReplacementText,
  Accounts_iframe_enabled: state.settings.Accounts_iframe_enabled,
  showLoginButton: getShowLoginButton(state),
  inviteLinkToken: state.inviteLinks.token
});

export default connect(mapStateToProps)(withTheme(OnboardingView));