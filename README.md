## To Run

* create an application-local.yaml or properties with the following info...
  ```
  spring:
    security:
      oauth2:
        resourceserver:
          jwt:
            issuer-uri: <issuer>
            audiences:
              - <aud>

  ```
* Create a self signed cert in `resources` and set the `JKS_PASSWORD` to the keystore password. 