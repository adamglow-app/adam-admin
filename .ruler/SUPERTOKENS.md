File length: 49320
# Quickstart -  Frontend Setup
Source: https://supertokens.com/docs/quickstart/frontend-setup

Start the setup by configuring your frontend application to use **SuperTokens** for authentication.

This guide uses the **SuperTokens pre-built UI** components.
If you want to create your own interface please check the **Custom UI** tutorial.



<PrebuiltUIInstructions>

## 1. Install the SDK

Run the following command in your terminal to install the package.

<Tabs>
  <Tab value="reactjs">
    <Tabs>
      <Tab value="npm7+">
        ```bash 
          npm i -s supertokens-auth-react
        ```
      </Tab>
      <Tab value="npm6">
        ```bash
        npm i -s supertokens-auth-react supertokens-web-js
        ```
      </Tab>
      <Tab value="yarn">
        ```bash
        yarn add supertokens-auth-react supertokens-web-js
        ```
      </Tab>
      <Tab value="pnpm">
        ```bash
        pnpm add supertokens-auth-react supertokens-web-js
        ```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="angular">
    <Tabs>
      <Tab value="npm7+">
        ```bash
        npm i -s supertokens-web-js
        ```
      </Tab>
      <Tab value="npm6">
        ```bash
        npm i -s supertokens-web-js
        ```
      </Tab>
      <Tab value="yarn">
        ```bash
        yarn add supertokens-web-js
        ```
      </Tab>
      <Tab value="pnpm">
        ```bash
        pnpm add supertokens-web-js
        ```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="vue">
    <Tabs>
      <Tab value="npm7+">
        ```bash
        npm i -s supertokens-web-js
        ```
      </Tab>
      <Tab value="npm6">
        ```bash
        npm i -s supertokens-web-js
        ```
      </Tab>
      <Tab value="yarn">
        ```bash
        yarn add supertokens-web-js
        ```
      </Tab>
      <Tab value="pnpm">
        ```bash
        pnpm add supertokens-web-js
        ```
      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 2. Initialize the SDK



<Tabs showMobileTab>
  <Tab value="reactjs">
    In your main application file call the `SuperTokens.init` function to initialize the SDK.
    The `init` call includes the [main configuration details](/docs/references/frontend-sdks/reference#sdk-configuration), as well as the **recipes** that you use in your setup.
    After that you have to wrap the application with the `SuperTokensWrapper` component.
    This provides authentication context for the rest of the UI tree.

    ```tsx

// highlight-start

SuperTokens.init({
  appInfo: {
    // learn more about this on https://supertokens.com/docs/references/frontend-sdks/reference#sdk-configuration
    appName: "<APP_NAME>",
    apiDomain: "<API_DOMAIN>",
    websiteDomain: "<WEBSITE_DOMAIN>",
    apiBasePath: "<API_BASE_PATH>",
    websiteBasePath: "<WEBSITE_BASE_PATH>",
  },
  recipeList: [EmailPassword.init(), Session.init()],
});
// highlight-end

/* Your App */
class App extends React.Component {
  render() {
    return (
      // highlight-next-line
      <SuperTokensWrapper>
        {/*Your app components*/}
        // highlight-next-line
      </SuperTokensWrapper>
    );
  }
}
```
  </Tab>
  <Tab value="angular">
    Before we initialize the `supertokens-web-js` SDK let's see how we use it in our Angular app.

    **Architecture**

    - The `supertokens-web-js` SDK is responsible for session management and providing helper functions to check if a session exists, or validate the access token claims on the frontend (for example, to check for user roles before showing some UI). We initialise this SDK on the root of your Angular app, so that all pages in your app can use it.
    - You have to create a `<WEBSITE_BASE_PATH>*` route in the Angular app which renders our pre-built UI. which also needs to be initialised, but only on that route.

    **Creating the `<WEBSITE_BASE_PATH>` route**

    - Use the Angular CLI to generate a new route

      ```bash
      ng generate module auth --route auth --module app.module
      ```

    - Add the following code to your `auth` angular component

    ```tsx title="/app/auth/auth.component.ts"

  @Component({
    selector: "app-auth",
    template: '<div id="supertokensui"></div>',
  })
  export class AuthComponent implements OnDestroy, AfterViewInit {
    constructor(
      private renderer: Renderer2,
      @Inject(DOCUMENT) private document: Document,
    ) {}

    ngAfterViewInit() {
      this.loadScript("^{prebuiltUIVersion}");
    }

    ngOnDestroy() {
      // Remove the script when the component is destroyed
      const script = this.document.getElementById("supertokens-script");
      if (script) {
        script.remove();
      }
    }

    private loadScript(src: string) {
      const script = this.renderer.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.id = "supertokens-script";
      script.onload = () => {
        supertokensUIInit({
          appInfo: {
            appName: "<APP_NAME>",
            apiDomain: "<API_DOMAIN>",
            websiteDomain: "<WEBSITE_DOMAIN>",
            apiBasePath: "<API_BASE_PATH>",
            websiteBasePath: "<WEBSITE_BASE_PATH>",
          },
          recipeList: [
            supertokensUIEmailPassword.init(),
            supertokensUISession.init(),
          ],
        });
      };
      this.renderer.appendChild(this.document.body, script);
    }
  }
  ```

    - In the `loadScript` function, we provide the SuperTokens config for the UI. We add the emailpassword and session recipe.

    - Initialize the `supertokens-web-js` SDK in your angular app's root component. This provides session management across your entire application.

    ```tsx title="/app/auth/auth.component.ts"

  @Component({
    selector: "app-auth",
    template: '<div id="supertokensui"></div>',
  })
  export class AuthComponent implements OnDestroy, AfterViewInit {
    constructor(
      private renderer: Renderer2,
      @Inject(DOCUMENT) private document: Document,
    ) {}

    ngAfterViewInit() {
      this.loadScript("^{prebuiltUIVersion}");
    }

    ngOnDestroy() {
      // Remove the script when the component is destroyed
      const script = this.document.getElementById("supertokens-script");
      if (script) {
        script.remove();
      }
    }

    private loadScript(src: string) {
      const script = this.renderer.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      script.id = "supertokens-script";
      script.onload = () => {
        supertokensUIInit({
          appInfo: {
            appName: "<APP_NAME>",
            apiDomain: "<API_DOMAIN>",
            websiteDomain: "<WEBSITE_DOMAIN>",
            apiBasePath: "<API_BASE_PATH>",
            websiteBasePath: "<WEBSITE_BASE_PATH>",
          },
          recipeList: [
            supertokensUIEmailPassword.init(),
            supertokensUISession.init(),
          ],
        });
      };
      this.renderer.appendChild(this.document.body, script);
    }
  }
  ```
  </Tab>
  <Tab value="vue">
    Before we initialize the `supertokens-web-js` SDK let's see how we use it in our Vue app

    **Architecture**

    - The `supertokens-web-js` SDK is responsible for session management and providing helper functions to check if a session exists, or validate the access token claims on the frontend (for example, to check for user roles before showing some UI). We initialise this SDK on the root of your Vue app, so that all pages in your app can use it.
    - We create a `<WEBSITE_BASE_PATH>*` route in the Vue app which renders our pre-built UI which also needs to be initialised, but only on that route.

    **Creating the `<WEBSITE_BASE_PATH>` route**

    - Create a new file `AuthView.vue`, this Vue component is used to render the auth component:

    ```tsx
  <script lang="ts">
      export default defineComponent({
          setup() {
              const loadScript = (src: string) => {
                  const script = document.createElement('script');
                  script.type = 'text/javascript';
                  script.src = src;
                  script.id = 'supertokens-script';
                  script.onload = () => {
                      supertokensUIInit({
                          appInfo: {
                              appName: "<APP_NAME>",
                              apiDomain: "<API_DOMAIN>",
                              websiteDomain: "<WEBSITE_DOMAIN>",
                              apiBasePath: "<API_BASE_PATH>",
                              websiteBasePath: "<WEBSITE_BASE_PATH>"
                          },
                          recipeList: [
                              supertokensUIEmailPassword.init(),
                              supertokensUISession.init(),
                          ],
                      });
                  };
                  document.body.appendChild(script);
              };

              onMounted(() => {
                  loadScript('^{prebuiltUIVersion}');
              });

              onUnmounted(() => {
                  const script = document.getElementById('supertokens-script');
                  if (script) {
                      script.remove();
                  }
              });
          },
      });
  </script>

  <template>
      <div id="supertokensui" />
  </template>
  ```

      - In the `loadScript` function, we provide the SuperTokens config for the UI. We add the emailpassword and session recipe.

    - Initialize the `supertokens-web-js` SDK in your Vue app's `main.ts` file. This provides session management across your entire application.

    ```tsx title="/main.ts "
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore

  SuperTokens.init({
    appInfo: {
      appName: "<APP_NAME>",
      apiDomain: "<API_DOMAIN>",
      apiBasePath: "<API_BASE_PATH>",
    },
    recipeList: [Session.init()],
  });

  const app = createApp(App);

  app.use(router);

  app.mount("#app");
  ```
  </Tab>
</Tabs>

## 3. Configure Routing

<Tabs showMobileTab>
  <Tab value="reactjs">
    In order for the **pre-built UI** to be rendered inside your application, you have to specify which routes show the authentication components.
    The **React SDK** uses [**React Router**](https://reactrouter.com/en/main) under the hood to achieve this.
    Based on whether you already use this package or not in your project, there are two different ways of configuring the routes.

    <Question question="Do you use react-router-dom?" defaultAnswer="Yes">
      <Answer title="Yes">
        Call the `getSuperTokensRoutesForReactRouterDom` method from within any `react-router-dom` `Routes` component.
        ```tsx

// highlight-next-line

class App extends React.Component {
    render() {
        return (
            <SuperTokensWrapper>
                <BrowserRouter>
                    <Routes>
                        {/*This renders the login UI on the <WEBSITE_BASE_PATH> route*/}
                        // highlight-next-line
                        {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI])}
                        {/*Your app routes*/}
                    </Routes>
                </BrowserRouter>
            </SuperTokensWrapper>
        );
    }
}
```
        :::important
If you are using `useRoutes`, `createBrowserRouter` or have routes defined in a different file, you need to adjust the code sample.
Please see [this issue](https://github.com/supertokens/supertokens-auth-react/issues/581#issuecomment-1246998493) for further details.
```tsx

function AppRoutes() {
  const authRoutes = getSuperTokensRoutesForReactRouterDom(
    reactRouterDom,
    [/* Add your UI recipes here e.g. EmailPasswordPrebuiltUI, PasswordlessPrebuiltUI, ThirdPartyPrebuiltUI */]
  );

  const routes = useRoutes([
    ...authRoutes.map(route => route.props),
    // Include the rest of your app routes 
  ]);

  return routes;
}

function App() {
  return (
    <SuperTokensWrapper>
      <BrowserRouter>
          <AppRoutes />
      </BrowserRouter>
    </SuperTokensWrapper>
  );
}
```
:::
      </Answer>
      <Answer title="No">
        Add the highlighted code snippet to your root level `render` function.
        ```tsx

class App extends React.Component {
    render() {
        // highlight-start
        if (canHandleRoute([EmailPasswordPreBuiltUI])) {
            // This renders the login UI on the <WEBSITE_BASE_PATH> route
            return getRoutingComponent([EmailPasswordPreBuiltUI])
        }
        // highlight-end

        return (
            <SuperTokensWrapper>{/*Your app*/}</SuperTokensWrapper>
        );
    }

}
```
      </Answer>
    </Question>
  </Tab>
  <Tab value="angular">
    Update your angular router so that all auth related requests load the `auth` component
    ```tsx title="/app/app-routing.module.ts"

const routes: Routes = [
  // highlight-start
  {
    path: "^{appInfo.websiteBasePath_withoutForwardSlash}",
    // @ts-ignore
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },

  {
    path: "**",
    // @ts-ignore
    loadChildren: () => import("./home/home.module").then((m) => m.HomeModule),
  },
  // highlight-end
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```
  </Tab>
  <Tab value="vue">
    Update your Vue router so that all auth related requests load the `AuthView` component
    ```tsx title="/router/index.ts"
// @ts-ignore
// @ts-ignore
// @ts-ignore

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "<WEBSITE_BASE_PATH>/:pathMatch(.*)*",
      name: "auth",
      component: AuthView,
    },
  ],
});

export default router;
```
  </Tab>
</Tabs>

## 4. Handle Session Tokens

This part is handled automatically by the **Frontend SDK**.
You don't need to do anything.
The step serves more as a way for us to tell you how is this handled under the hood.

After you call the `init` function, the **SDK** adds interceptors to both `fetch` and `XHR`, XMLHTTPRequest. The latter is used by the `axios` library.
The interceptors save the session tokens that are generated from the authentication flow.
Those tokens are then added to requests initialized by your frontend app which target the backend API.
By default, the tokens are stored through session cookies but you can also switch to [header based authentication](/docs/post-authentication/session-management/switch-between-cookies-and-header-authentication).

## 5. Secure Application Routes

In order to prevent unauthorized access to certain parts of your frontend application you can use our utilities.
Follow the code samples below to understand how to do this.

<Tabs>
  <Tab value="reactjs">
    You can wrap your components with the `<SessionAuth>` react component. This ensures that your component renders only if the user is logged in. If they are not logged in, the user is redirected to the login page.
    ```tsx
    // highlight-next-line
    // @ts-ignore

    class App extends React.Component {
      render() {
        return (
          <BrowserRouter>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  // highlight-start
                  <SessionAuth>
                    {/*Components that require to be protected by authentication*/}
                    <MyDashboardComponent />
                  </SessionAuth>
                  // highlight-end
                }
              />
            </Routes>
          </BrowserRouter>
        );
      }
    }
    ```
  </Tab>
  <Tab value="angular">
    You can use the `doesSessionExist` function to check if a session exists in all your routes.
      ```tsx

      async function doesSessionExist() {
        if (await Session.doesSessionExist()) {
          // user is logged in
        } else {
          // user has not logged in yet
        }
      }
      ```
  </Tab>
  <Tab value="vue">
    You can use the `doesSessionExist` function to check if a session exists in all your routes.
      ```tsx

      async function doesSessionExist() {
        if (await Session.doesSessionExist()) {
          // user is logged in
        } else {
          // user has not logged in yet
        }
      }
      ```
  </Tab>
</Tabs>

## 6. View the login UI

You can check the login UI by visiting the `<WEBSITE_BASE_PATH>` route, in your frontend application.
To review all the components of our pre-built UI please follow [this link](https://master--6571be2867f75556541fde98.chromatic.com/?path=/story/auth-page--playground).

</PrebuiltUIInstructions>

<CustomUIInstructions name="custom-ui">

## 1. Install the SDK

Use the following command to install the required package.

<Tabs>
  <Tab value="web">
    <Tabs>
      <Tab value="npm">
        ```bash
        npm i -s supertokens-web-js
        ```
      </Tab>
      <Tab value="scripts">

          <Tabs.Section>
          You need to add all of the following scripts to your app
          </Tabs.Section>

          ```html
          <script src="^{webJsVersions.website}"></script>
          <script src="^{webJsVersions.supertokens}"></script>
          <script src="^{webJsVersions.session}"></script>
          <script src="^{webJsVersions.emailpassword}"></script>
          ```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="mobile">
    :::info
    If you want to implement a common authentication experience for both web and mobile, please look at our [**Unified Login guide**](/docs/authentication/unified-login/introduction).
    :::
    <Tabs>
      <Tab value="reactnative">
        ```bash
        npm i -s supertokens-react-native
# IMPORTANT: If you already have @react-native-async-storage/async-storage as a dependency, make sure the version is 1.12.1 or higher
        npm i -s @react-native-async-storage/async-storage
        ```
      </Tab>
      <Tab value="android">
        Add to your `settings.gradle`:
        ```bash
        dependencyResolutionManagement {
            ...
            repositories {
                ...
                maven { url 'https://jitpack.io' }
            }
        }
        ```

        Add the following to you app level's `build.gradle`:
        ```bash
        implementation 'com.github.supertokens:supertokens-android:X.Y.Z'
        ```

        You can find the latest version of the SDK [here](https://github.com/supertokens/supertokens-android/releases) (ignore the `v` prefix in the releases).
      </Tab>
      <Tab value="ios">

#### Using Cocoapods

        Add the Cocoapod dependency to your Podfile

        ```bash
        pod 'SuperTokensIOS'
        ```

#### Using Swift Package Manager

        Follow the [official documentation](https://developer.apple.com/documentation/xcode/adding-package-dependencies-to-your-app) to learn how to use Swift Package Manager to add dependencies to your project.

        When adding the dependency use the `master` branch after you enter the supertokens-ios repository URL:

        ```bash
        https://github.com/supertokens/supertokens-ios
        ```

</Tab>

<Tab value="flutter">

Add the dependency to your pubspec.yaml

```bash
supertokens_flutter: ^X.Y.Z
```

You can find the latest version of the SDK [here](https://github.com/supertokens/supertokens-flutter/releases) (ignore the `v` prefix in the releases).

</Tab>

</Tabs>

</Tab>

</Tabs>

## 2. Initialise SuperTokens



Call the SDK init function at the start of your application.
The invocation includes the [main configuration details](/docs/references/frontend-sdks/reference#sdk-configuration), as well as the **recipes** that you use in your setup.

<Tabs>
  <Tab value="web">
    <Tabs>
      <Tab value="npm">
        ```tsx

SuperTokens.init({
    appInfo: {
        apiDomain: "<API_DOMAIN>",
        apiBasePath: "<API_BASE_PATH>",
        appName: "...",
    },
    recipeList: [
        Session.init(),
        EmailPassword.init(),
    ],
});
```
      </Tab>
      <Tab value="scripts">
        ```tsx
supertokens.init({
    appInfo: {
        apiDomain: "<API_DOMAIN>",
        apiBasePath: "<API_BASE_PATH>",
        appName: "...",
    },
    recipeList: [
        supertokensSession.init(),
        supertokensEmailPassword.init(),
    ],
});
```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="mobile">
    <Tabs>
      <Tab value="reactnative">

  ```tsx

  SuperTokens.init({
      apiDomain: "<API_DOMAIN>",
      apiBasePath: "<API_BASE_PATH>",
  });
  ```
      </Tab>
      <Tab value="android">
        Add the `SuperTokens.init` function call at the start of your application.
        ```kotlin
      </Tab>
      <Tab value="ios">
        ```swift
      </Tab>
      <Tab value="flutter">
  ```dart

  void main() {
      SuperTokens.init(
          apiDomain: "<API_DOMAIN>",
          apiBasePath: "<API_BASE_PATH>",
      );
  }
  ```

      </Tab>
    </Tabs>
  </Tab>
</Tabs>

## 3. Add the Login UI

The **Email/Password** flow involves two types of user interfaces. 
One for registering and creating new users, the *Sign Up Form*.
And one for the actual authentication attempt, the *Sign In Form*.
If you are provisioning users from a different method you can skip over adding the sign up form.

### 3.1 Add the Sign Up form

<Tabs>
  <Tab value="web">
    For the **Sign Up** flow you have to first add the UI elements which render your form.
    After that, call the following function when the user submits the form that you have previously created. 
    <Tabs>
      <Tab value="npm">

```tsx

async function signUpClicked(email: string, password: string) {
    try {
        let response = await signUp({
            formFields: [{
                id: "email",
                value: email
            }, {
                id: "password",
                value: password
            }]
        })

        if (response.status === "FIELD_ERROR") {
            // one of the input formFields failed validation
            response.formFields.forEach(formField => {
                if (formField.id === "email") {
                    // Email validation failed (for example incorrect email syntax),
                    // or the email is not unique.
                    window.alert(formField.error)
                } else if (formField.id === "password") {
                    // Password validation failed.
                    // Maybe it didn't match the password strength
                    window.alert(formField.error)
                }
            })
        } else if (response.status === "SIGN_UP_NOT_ALLOWED") {
            // the reason string is a user friendly message
            // about what went wrong. It can also contain a support code which users
            // can tell you so you know why their sign up was not allowed.
            window.alert(response.reason)
        } else {
            // sign up successful. The session tokens are automatically handled by
            // the frontend SDK.
            window.location.href = "/homepage"
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```

      </Tab>
      <Tab value="scripts">

```tsx
async function signUpClicked(email: string, password: string) {
    try {
        let response = await supertokensEmailPassword.signUp({
            formFields: [{
                id: "email",
                value: email
            }, {
                id: "password",
                value: password
            }]
        })

        if (response.status === "FIELD_ERROR") {
            // one of the input formFields failed validation
            response.formFields.forEach(formField => {
                if (formField.id === "email") {
                    // Email validation failed (for example incorrect email syntax),
                    // or the email is not unique.
                    window.alert(formField.error)
                } else if (formField.id === "password") {
                    // Password validation failed.
                    // Maybe it didn't match the password strength
                    window.alert(formField.error)
                }
            })
        } else if (response.status === "SIGN_UP_NOT_ALLOWED") { 
            // the reason string is a user friendly message
            // about what went wrong. It can also contain a support code which users
            // can tell you so you know why their sign in was not allowed.
            window.alert(response.reason)
        } else {
            // sign up successful. The session tokens are automatically handled by
            // the frontend SDK.
            window.location.href = "/homepage"
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```

      </Tab>
    </Tabs>
  </Tab>
  <Tab value="mobile">
    For the **Sign Up** flow you have to first add the UI elements which render your form.
    After that, call the following API when the user submits the form that you have previously created.

    ```bash
    curl --location --request POST '<API_DOMAIN><API_BASE_PATH>/signup' \
    --header 'Content-Type: application/json; charset=utf-8' \
    --data-raw '{
        "formFields": [{
            "id": "email",
            "value": "john@example.com"
        }, {
            "id": "password",
            "value": "somePassword123"
        }]
    }'
    ```

    The response body from the API call has a `status` property in it:
    - `status: "OK"`: User creation was successful. The response also contains more information about the user, for example their user ID.
    - `status: "FIELD_ERROR"`: One of the form field inputs failed validation. The response body contains information about which form field input based on the `id`:
        - The email could fail validation if it's syntactically not an email, of it it's not unique.
        - The password could fail validation if it's not string enough (as defined by the backend password validator).

        Either way, you want to show the user an error next to the input form field.
    - `status: "GENERAL_ERROR"`: This is only possible if you have overridden the backend API to send back a custom error message which should be displayed on the frontend.
    - `status: "SIGN_UP_NOT_ALLOWED"`: This can happen during automatic account linking or during MFA. The `reason` prop that's in the response body contains a support code using which you can see why the sign up was not allowed.

  </Tab>
</Tabs>

The `formFields` input is a key-value array. You must provide it an `email` and a `password` value at a minimum. If you want to provide additional items, for example the user's name or age, you can append it to the array like so:

```json
{
    "formFields": [{
        "id": "email",
        "value": "john@example.com"
    }, {
        "id": "password",
        "value": "somePassword123"
    }, {
        "id": "name",
        "value": "John Doe"
    }]
}
```

On the backend, the `formFields` array is available to you for consumption.

On success, the backend sends back session tokens as part of the response headers which are automatically handled by our frontend SDK for you.

#### How to check if an email is unique

As a part of the sign up form, you may want to explicitly check that the entered email is unique.
Whilst this is already done via the sign up API call, it may be a better UX to warn the user about a non unique email right after they finish typing it.

<Tabs>
  <Tab value="web">
    <Tabs>
      <Tab value="npm">
        ```tsx

async function checkEmail(email: string) {
    try {
        let response = await doesEmailExist({
            email
        });

        if (response.doesExist) {
            window.alert("Email already exists. Please sign in instead")
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```
      </Tab>
      <Tab value="scripts">
        ```tsx
async function checkEmail(email: string) {
    try {
        let response = await supertokensEmailPassword.doesEmailExist({
            email
        });

        if (response.doesExist) {
            window.alert("Email already exists. Please sign in instead")
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="mobile">

```bash
curl --location --request GET '<API_DOMAIN><API_BASE_PATH>/emailpassword/email/exists?email=john@example.com'
```

The response body from the API call has a `status` property in it:
- `status: "OK"`: The response also contains a `exists` boolean which is `true` if the input email already belongs to an email password user.
- `status: "GENERAL_ERROR"`: This is only possible if you have overridden the backend API to send back a custom error message which should be displayed on the frontend.

</Tab>
</Tabs>

### 3.2 Add the Sign In Form

<Tabs>
  <Tab value="web">
    For the **Sign In** flow you have to first add the UI elements which render your form.
    After that, call the following function when the user submits the form that you have previously created. 
    <Tabs>
      <Tab value="npm">
        ```tsx

async function signInClicked(email: string, password: string) {
    try {
        let response = await signIn({
            formFields: [{
                id: "email",
                value: email
            }, {
                id: "password",
                value: password
            }]
        })

        if (response.status === "FIELD_ERROR") {
            response.formFields.forEach(formField => {
                if (formField.id === "email") {
                    // Email validation failed (for example incorrect email syntax).
                    window.alert(formField.error)
                }
            })
        } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
            window.alert("Email password combination is incorrect.")
        } else if (response.status === "SIGN_IN_NOT_ALLOWED") {
            // the reason string is a user friendly message
            // about what went wrong. It can also contain a support code which users
            // can tell you so you know why their sign in was not allowed.
            window.alert(response.reason)
        } else {
            // sign in successful. The session tokens are automatically handled by
            // the frontend SDK.
            window.location.href = "/homepage"
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```
      </Tab>
      <Tab value="scripts">
        ```tsx
async function signInClicked(email: string, password: string) {
    try {
        let response = await supertokensEmailPassword.signIn({
            formFields: [{
                id: "email",
                value: email
            }, {
                id: "password",
                value: password
            }]
        })

        if (response.status === "FIELD_ERROR") {
            // one of the input formFields failed validation
            response.formFields.forEach(formField => {
                if (formField.id === "email") {
                    // Email validation failed (for example incorrect email syntax).
                    window.alert(formField.error)
                }
            })
        } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
            window.alert("Email password combination is incorrect.")
        } else if (response.status === "SIGN_IN_NOT_ALLOWED") {
            // the reason string is a user friendly message
            // about what went wrong. It can also contain a support code which users
            // can tell you so you know why their sign in was not allowed.
            window.alert(response.reason)
        } else {
            // sign in successful. The session tokens are automatically handled by
            // the frontend SDK.
            window.location.href = "/homepage"
        }
    } catch (err: any) {
        if (err.isSuperTokensGeneralError === true) {
            // this may be a custom error message sent from the API by you.
            window.alert(err.message);
        } else {
            window.alert("Oops! Something went wrong.");
        }
    }
}
```
      </Tab>
    </Tabs>
  </Tab>
  <Tab value="mobile">
    For the **Sign In** flow you have to first add the UI elements which render your form.
    After that, call the following API when the user submits the form that you have previously created. 
    ```bash
curl --location --request POST '<API_DOMAIN><API_BASE_PATH>/signin' \
--header 'Content-Type: application/json; charset=utf-8' \
--data-raw '{
    "formFields": [{
        "id": "email",
        "value": "john@example.com"
    }, {
        "id": "password",
        "value": "somePassword123"
    }]
}'
```

    The response body from the API call has a `status` property in it:
    - `status: "OK"`: User sign in was successful. The response also contains more information about the user, for example their user ID.
    - `status: "WRONG_CREDENTIALS_ERROR"`: The input email and password combination is incorrect.
    - `status: "FIELD_ERROR"`: This indicates that the input email did not pass the backend validation - probably because it's syntactically not an email. You want to show the user an error next to the email input form field.
    - `status: "GENERAL_ERROR"`: This is only possible if you have overridden the backend API to send back a custom error message which should be displayed on the frontend.
    - `status: "SIGN_IN_NOT_ALLOWED"`: This can happen during automatic account linking or during MFA. The `reason` prop that's in the response body contains a support code using which you can see why the sign in was not allowed.
  
  </Tab>
</Tabs>

On success, the backend sends back session tokens as part of the response headers which are automatically handled by our frontend SDK for you.

## 4. Handle Session Tokens

You can use sessions with SuperTokens in two modes:
- Using `httpOnly` cookies
- Authorization bearer token.

Our frontend SDK uses `httpOnly` cookie based session for websites by default as it secures against tokens theft via XSS attacks. 
For other platforms, like mobile apps, we use a bearer token in the `Authorization` header by default.

### With the Frontend SDK

<Tabs>
<Tab value="web">

:::success
No action required.
:::

Our frontend SDK handles everything for you. You only need to make sure that you have called `supertokens.init` before making any network requests.

Our SDK adds interceptors to `fetch` and `XHR` (used by `axios`) to save and add session tokens from and to the request.

By default, our web SDKs use cookies to provide credentials.

</Tab>

<Tab value="mobile">

<Tabs>

<Tab value="reactnative">
  <Tabs.Section>
    Our frontend SDK handles everything for you. You only need to make sure that you have added our network interceptors as shown below
  </Tabs.Section>
  <Tabs.Section py="0">

:::note
By default our mobile SDKs use a bearer token in the Authorization header to provide credentials.
:::
  </Tabs.Section>

<Tabs>
  <Tab value="axios">
    <Tabs.Section>                      

<Question
    cardVariant="ghost"
    questionSize="4"
    defaultAnswer="Yes"
    question={() => {
            return (
                <span>Are you using <code>axios.create</code>?</span>
            )
        }}>
<Answer title="Yes">

```tsx
// highlight-next-line

let axiosInstance = axios.create({/*...*/});
// highlight-next-line
SuperTokens.addAxiosInterceptors(axiosInstance);

async function callAPI() {
    // use axios as you normally do
    let response = await axiosInstance.get("https://yourapi.com");
}
```

</Answer>

<Answer title="No">

:::important
You must call `addAxiosInterceptors` on all `axios` imports.
:::

```tsx
// highlight-start
SuperTokens.addAxiosInterceptors(axios);
// highlight-end

async function callAPI() {
    // use axios as you normally do
    let response = await axios.get("https://yourapi.com");
}
```

</Answer>
</Question>

                                    </Tabs.Section>

  </Tab>
  <Tab value="fetch">
                          

:::success
When using `fetch`, network interceptors are added automatically when you call `supertokens.init`. So no action needed here.
:::

  </Tab>
 
</Tabs>

</Tab>

<Tab value="android">

<Question question="Which library are you using for networking?">
<Answer title="HttpURLConnection">

```kotlin

```dart
// Import http from the SuperTokens package

Future<void> makeRequest() async {
    Uri uri = Uri.parse("http://localhost:3001/api");
    var response = await http.get(uri);
    // handle response
}
```

<h4>Using a custom HTTP client</h4>

If you use a custom HTTP client and want to use SuperTokens, you can simply provide the SDK with your client. All requests continue to use your client along with the session logic that SuperTokens provides.

```dart
// Import http from the SuperTokens package

Future<void> makeRequest() async {
    Uri uri = Uri.parse("http://localhost:3001/api");

    // Initialise your custom client
    var customClient = http.Client();
    // provide your custom client to SuperTokens
    var httpClient = http.Client(client: customClient);

    var response = await httpClient.get(uri);
    // handle response
}
```

</Answer>
<Answer title="Dio">

<h4>Add the SuperTokens interceptor</h4>

Use the extension method provided by the SuperTokens SDK to enable interception on your `Dio` client. This allows the SuperTokens SDK to handle session tokens for you.

```dart

void setup() {
  Dio dio = Dio();  // Create a Dio instance.
  dio.addSupertokensInterceptor();
}
```

<h4>Making network requests</h4>

You can make requests as you normally would with `dio`.

```dart

void setup() {
    Dio dio = Dio(
        // Provide your config here
    );
    dio.addSupertokensInterceptor();

    var response = dio.get("http://localhost:3001/api");
    // handle response
}
```

</Answer>
</Question>

:::note
By default our mobile SDKs use a bearer token in the Authorization header to provide credentials.
:::

</Tab>

</Tabs>

</Tab>
</Tabs>

### Without the Frontend SDK

:::caution
We highly recommend using our frontend SDK to handle session token management. It saves you a lot of time.
:::

In this case, you need to manually handle the tokens and session refreshing, and decide if you are going to use header or cookie-based sessions.

For browsers, we recommend cookies, while for mobile apps (or if you don't want to use the built-in cookie manager) you should use header-based sessions.

<Question question="Which request authentication mode are you using?" defaultAnswer="Cookie">
    
<Answer title="Cookie">

#### During the Login Action 

You should attach the `st-auth-mode` header to calls to the login API, but this header is safe to attach to all requests. In this case it should be set to "cookie".

The login API returns the following headers:
- `Set-Cookie`: This contains the `sAccessToken`, `sRefreshToken` cookies which are `httpOnly` and are automatically managed by the browser. For mobile apps, you need to setup cookie handling yourself, use our SDK or use a header based authentication mode.
- `front-token` header: This contains information about the access token:
    - The userID
    - The expiry time of the access token
    - The payload added by you in the access token.
    
    Here is the structure of the token:
    ```tsx
    let frontTokenFromRequestHeader = "...";
    let frontTokenDecoded = JSON.parse(decodeURIComponent(escape(atob(frontTokenFromRequestHeader))));
    console.log(frontTokenDecoded);
    /*
    {
        ate: 1665226412455, // time in milliseconds for when the access token expires, and then a refresh is required
        uid: "....", // user ID
        up: {
            sub: "..",
            iat: ..,
            ... // other access token payload
        }
    }
    
    */
    ```

    This token is mainly used for cookie based auth because you don't have access to the actual access token on the frontend (for security reasons), but may want to read its payload (for example to know the user's role). This token itself is not signed and hence can't be used in place of the access token itself. You may want to save this token in `localstorage` or in frontend cookies (using `document.cookies`).

- `anti-csrf` header (optional): By default it's not required, so it's not sent. But if this is sent, you should save this token as well for use when making requests.

#### When You Make Network Requests to Protected APIs

The `sAccessToken` gets attached to the request automatically by the browser. Other than that, you need to add the following headers to the request:
- `rid: "anti-csrf"` - this prevents against anti-CSRF requests. If your `apiDomain` and `websiteDomain` values are exactly the same, then this is not necessary.
- `anti-csrf` header (optional): If this was provided to you during login, then you need to add that token as the value of this header.
- You need to set the `credentials` header to `true` or `include`. This is achieved different based on the library you are using to make requests.

An API call can potentially update the `sAccessToken` and `front-token` tokens, for example if you call the `mergeIntoAccessTokenPayload` function on the `session` object on the backend. This kind of update is reflected in the response headers for your API calls. The headers contain new values for:
- `sAccessToken`: This is as a new `Set-Cookie` header and is managed by the browser automatically.
- `front-token`: This should be read and saved by you in the same way as it's being done during login.

#### Handling session refreshing

If any of your API calls return with a status code of `401`, it means that the access token has expired. This requires you to refresh the session before retrying the same API call.

You can call the refresh API as follows:

```bash
curl --location --request POST '<API_DOMAIN><API_BASE_PATH>/session/refresh' \
--header 'Cookie: sRefreshToken=...'
```

:::note
- You may also need to add the `anti-csrf` header to the request if that was provided to you during sign in.
- The cURL command above shows the `sRefreshToken` cookie as well, but this is added by the web browser automatically, so you don't need to add it explicitly.
:::

The result of a session refresh is either:
- Status code `200`: This implies a successful refresh. The set of tokens returned here is the same as when the user logs in, so you can handle them in the same way.
- Status code `401`: This means that the refresh token is invalid, or has been revoked. You must ask the user to login again. Remember to clear the `front-token` that you saved on the frontend earlier.

</Answer>

<Answer title="Header (Authorization Bearer)">

##### During the Login Action

You should attach the `st-auth-mode` header to calls to the login API, but this header is safe to attach to all requests. In this case it should be set to "header".

The login API returns the following headers:
- `st-access-token`: This contains the current access token associated with the session. You should save this in your application (e.g., in frontend `localstorage`).
- `st-refresh-token`: This contains the current refresh token associated with the session. You should save this in your application (e.g., in frontend `localstorage`).

#### When You Make Network Requests to Protected APIs

You need to add the following headers to request:
- `authorization: Bearer {access-token}`
- You need to set the `credentials` to `true` or `include`. This is achieved different based on the library you are using to make requests.

An API call can potentially update the `access-token`, for example if you call the `mergeIntoAccessTokenPayload` function on the `session` object on the backend. This kind of update is reflected in the response headers for your API calls. The headers contain new values for `st-access-token`

These should be read and saved by you in the same way as it's being done during login.

#### Handling session refreshing

If any of your API calls return with a status code of `401`, it means that the access token has expired. This requires you to refresh the session before retrying the same API call.

You can call the refresh API as follows:

```bash
curl --location --request POST '<API_DOMAIN><API_BASE_PATH>/session/refresh' \
--header 'authorization: Bearer {refresh-token}'
```

The result of a session refresh is either:
- Status code `200`: This implies a successful refresh. The set of tokens returned here is the same as when the user logs in, so you can handle them in the same way.
- Status code `401`: This means that the refresh token is invalid, or has been revoked. You must ask the user to login again. Remember to clear the `st-refresh-token` and `st-access-token` that you saved on the frontend earlier.

</Answer>

</Question>

## 5. Protect Frontend Routes

<Tabs>

<Tab value="web">

<Tabs>

<Tab value="npm">

You can use the `doesSessionExist` function to check if a session exists.

```tsx

async function doesSessionExist() {
    if (await Session.doesSessionExist()) {
        // user is logged in
    } else {
        // user has not logged in yet
    }
}
```

</Tab>

<Tab value="scripts">

You can use the `doesSessionExist` function to check if a session exists.

```tsx
async function doesSessionExist() {
    if (await Session.doesSessionExist()) {
        // user is logged in
    } else {
        // user has not logged in yet
    }
}
```

</Tab>
</Tabs>

</Tab>

<Tab value="mobile">

<Tabs>

<Tab value="reactnative">

You can use the `doesSessionExist` function to check if a session exists.

```tsx

async function doesSessionExist() {
    if (await SuperTokens.doesSessionExist()) {
        // user is logged in
    } else {
        // user has not logged in yet
    }
}
```

</Tab>

<Tab value="android">

You can use the `doesSessionExist` function to check if a session exists.

```kotlin

Future<bool> doesSessionExist() async {
    return await SuperTokens.doesSessionExist();
}
```

</Tab>

</Tabs>

</Tab>

</Tabs>

## 6. Add a Sign Out Action

The `signOut` method revokes the session on the frontend and on the backend. Calling this function without a valid session also yields a successful response.

<Tabs>
  <Tab value="web">
    <Tabs>
      <Tab value="npm">
        ```tsx

        async function logout () {
          // highlight-next-line
          await Session.signOut(); 
          window.location.href = "/auth"; // or to wherever your logic page is
        }
        ```
      </Tab>
      <Tab value="scripts">
        ```tsx
        async function logout () {
          // highlight-next-line
          await supertokensSession.signOut(); 
          window.location.href = "/auth"; // or to wherever your logic page is
        }
        ```
      </Tab>
    </Tabs>
  </Tab>
<Tab value="mobile">
  <Tabs>
    <Tab value="reactnative">

```tsx

async function logout () {
  // highlight-next-line
  await SuperTokens.signOut(); 
  // navigate to the login screen..
}
```
    </Tab>
    <Tab value="android">

```kotlin
        // navigate to the login screen..
    }
}
```
    </Tab>
    <Tab value="ios">

```swift

Future<void> signOut() async {
  await SuperTokens.signOut(
    completionHandler: (error) {
      // handle error if any
    }
  );
}
```
    </Tab>
  </Tabs>
</Tab>
</Tabs>

- On success, the `signOut` function does not redirect the user to another page, so you must redirect the user yourself.
- The `signOut` function calls the sign out API exposed by the session recipe on the backend.
- If you call the `signOut` function whilst the access token has expired, but the refresh token still exists, our SDKs do an automatic session refresh before revoking the session.

</CustomUIInstructions>

:::success 🎉 Congratulations 🎉

Congratulations! You've successfully integrated your frontend app with SuperTokens.

The [next section](./backend-setup) guides you through setting up your backend and then you should be able to complete a login flow.

:::