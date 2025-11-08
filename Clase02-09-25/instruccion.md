# 09/2025
1. crear clave privada ca
2. crear clave privada ca firmado con 1
3. clave privada del servidor
4. crear el CSR del servidor firmado con el 3

El punto 4 se pasa a la CA
5. Firma CSR con la clave privada de CA
6. el punto 5 genera el Certificado del servidor
7 se instala en el servidor el
1-2 ca
3-4 localhost
