export const questions = [
  {
    pregunta: "¿Qué es la seguridad en la nube y por qué es importante?",
    opciones: [
      "Un conjunto de herramientas que solo protegen servidores físicos.",
      "Un sistema que elimina la necesidad de controles de acceso en la nube.",
      "Un conjunto de tecnologías y prácticas para proteger datos, aplicaciones e infraestructura en la nube.",
      "Un servicio exclusivo de los proveedores de nube que garantiza seguridad total.",
    ],
    respuesta:
      "Un conjunto de tecnologías y prácticas para proteger datos, aplicaciones e infraestructura en la nube.",
  },
  {
    pregunta:
      "¿Cuál es la diferencia entre seguridad en la nube y seguridad tradicional en infraestructura local?",
    opciones: [
      "En la nube, los proveedores son responsables de toda la seguridad.",
      "La seguridad en la nube protege servidores locales, mientras que la tradicional protege servicios en la nube.",
      "La seguridad en la nube se basa en un modelo de responsabilidad compartida, mientras que la tradicional se gestiona completamente por la empresa.",
      "No hay diferencias, ambas requieren el mismo enfoque.",
    ],
    respuesta:
      "La seguridad en la nube se basa en un modelo de responsabilidad compartida, mientras que la tradicional se gestiona completamente por la empresa.",
  },
  {
    pregunta:
      "¿Cuáles son los principales riesgos de seguridad en entornos de nube pública?",
    opciones: [
      "Mayor latencia en el acceso a datos.",
      "Accesos no autorizados, vulnerabilidades en APIs y ataques DDoS.",
      "Falta de escalabilidad de los servidores.",
      "Incompatibilidad con modelos de inteligencia artificial.",
    ],
    respuesta:
      "Accesos no autorizados, vulnerabilidades en APIs y ataques DDoS.",
  },
  {
    pregunta:
      "¿Qué es el modelo de responsabilidad compartida en la nube y cómo afecta la seguridad?",
    opciones: [
      "Solo el proveedor de la nube es responsable de la seguridad de los datos.",
      "La empresa es la única responsable de la seguridad de su infraestructura en la nube.",
      "El proveedor gestiona la seguridad de la infraestructura, mientras que el usuario debe proteger sus datos y configuraciones.",
      "No tiene impacto en la seguridad, ya que todas las amenazas están mitigadas automáticamente.",
    ],
    respuesta:
      "El proveedor gestiona la seguridad de la infraestructura, mientras que el usuario debe proteger sus datos y configuraciones.",
  },
  {
    pregunta:
      "¿Cuáles son las mejores prácticas para proteger los datos almacenados en la nube?",
    opciones: [
      "Evitar el uso de autenticación multifactor.",
      "Usar cifrado, controles de acceso y monitoreo continuo.",
      "Compartir credenciales con todos los empleados para facilitar el acceso.",
      "No realizar copias de seguridad para evitar duplicaciones de datos.",
    ],
    respuesta: "Usar cifrado, controles de acceso y monitoreo continuo.",
  },
  {
    pregunta: "¿En qué momentos se recomienda aplicar cifrado en la nube?",
    opciones: [
      "Solo durante el procesamiento de datos.",
      "Al almacenar datos (reposo) y transmitirlos (tránsito).",
      "Únicamente al compartir datos por correo electrónico.",
      "Nunca, porque la nube ya es segura por defecto.",
    ],
    respuesta: "Al almacenar datos (reposo) y transmitirlos (tránsito).",
  },
  {
    pregunta:
      "¿Cómo pueden los controles de acceso y la autenticación multifactor (MFA) mejorar la seguridad en la nube?",
    opciones: [
      "Evitan ataques de phishing en redes locales.",
      "Permiten que todos los empleados accedan sin restricciones a la nube.",
      "Limitan el acceso solo a usuarios autorizados y agregan una capa extra de protección con múltiples factores de autenticación.",
      "Hacen que el acceso a la nube sea más lento y complicado.",
    ],
    respuesta:
      "Limitan el acceso solo a usuarios autorizados y agregan una capa extra de protección con múltiples factores de autenticación.",
  },
  {
    pregunta:
      "¿Qué rol juegan los firewalls en la protección de aplicaciones en la nube?",
    opciones: [
      "Permiten conexiones ilimitadas desde cualquier dirección IP.",
      "Filtran tráfico malicioso y bloquean ataques antes de que lleguen a la red interna.",
      "Aceleran la velocidad de los servidores en la nube.",
      "Eliminan la necesidad de cifrado de datos en la nube.",
    ],
    respuesta:
      "Filtran tráfico malicioso y bloquean ataques antes de que lleguen a la red interna.",
  },
  {
    pregunta:
      "¿Por qué es importante la gestión de identidades y accesos (IAM) en la nube?",
    opciones: [
      "Permite centralizar el control de accesos y aplicar el principio de mínimo privilegio.",
      "Reduce la velocidad de las aplicaciones.",
      "Elimina la necesidad de contraseñas.",
      "Solo se usa para cifrar datos.",
    ],
    respuesta:
      "Permite centralizar el control de accesos y aplicar el principio de mínimo privilegio.",
  },
  {
    pregunta:
      "¿Cómo afectan las vulnerabilidades en API a la seguridad en la nube y cómo se pueden mitigar?",
    opciones: [
      "No representan riesgos, ya que las APIs siempre están protegidas.",
      "Pueden permitir ataques como la exposición de datos y deben mitigarse con autenticación robusta y control de tráfico.",
      "Solo afectan aplicaciones locales, no servicios en la nube.",
      "No tienen impacto en la seguridad si se usan conexiones HTTPS.",
    ],
    respuesta:
      "Pueden permitir ataques como la exposición de datos y deben mitigarse con autenticación robusta y control de tráfico.",
  },
  {
    pregunta:
      "¿Qué herramientas existen para monitorear la seguridad en la nube y detectar amenazas?",
    opciones: [
      "AWS Security Hub, Azure Security Center y Google Security Command Center.",
      "Microsoft Word, Excel y PowerPoint.",
      "Google Drive, Dropbox y OneDrive.",
      "Aplicaciones de mensajería como WhatsApp y Telegram.",
    ],
    respuesta:
      "AWS Security Hub, Azure Security Center y Google Security Command Center.",
  },
  {
    pregunta:
      "¿Cuáles son las diferencias clave entre la seguridad en entornos de nube pública, privada e híbrida?",
    opciones: [
      "La nube pública permite mayor control de seguridad que la privada.",
      "La nube híbrida combina elementos de seguridad de nubes pública y privada.",
      "La seguridad es idéntica en todos los modelos de nube.",
      "La nube privada es menos segura que la pública.",
    ],
    respuesta:
      "La nube híbrida combina elementos de seguridad de nubes pública y privada.",
  },
  {
    pregunta:
      "¿Qué técnicas se pueden utilizar para prevenir ataques DDoS en la nube?",
    opciones: [
      "Usar firewalls, limitar el tráfico por IP y sistemas anti-DDoS.",
      "Deshabilitar la autenticación en los servicios en la nube.",
      "Usar solo contraseñas débiles para permitir accesos rápidos.",
      "No tomar ninguna acción, ya que los ataques DDoS no afectan la nube.",
    ],
    respuesta:
      "Usar firewalls, limitar el tráfico por IP y sistemas anti-DDoS.",
  },
];
