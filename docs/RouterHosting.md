# Hosting on the router

This guide covers hosting Gallery on a local network via a router so devices on the LAN (and optionally the WAN) can access it.

## Basic steps
1. Run Gallery on a machine in your LAN. By default it listens on a configurable `tech.port` (see `settings.json`).
2. Ensure the host machine has a static local IP or a DHCP reservation so the IP does not change.
3. On the router, configure port forwarding from the router WAN port (e.g. 80 or a custom port) to the host machine's local IP and Gallery port.

## Dynamic DNS
If your ISP provides a dynamic public IP, use a Dynamic DNS provider (DDNS) and point a hostname to your router. Many routers have built-in DDNS client support.

## Security & HTTPS
- If exposing the site to the public internet, terminate HTTPS at the router (if it supports it) or run a reverse proxy on the host with Let's Encrypt certificates.
- Restrict upload access by enabling authentication or placing the upload/admin pages behind a VPN or firewall rules.

## Firewall rules
- Allow the chosen Gallery port in the host's firewall for incoming LAN (and WAN if exposed) traffic.

## Router capabilities
- Some consumer routers support reverse proxying, firewall rules, and SSL. If yours doesn't, run Nginx on the host to handle TLS and proxying.

## Troubleshooting
- If the site is unreachable from outside, check ISP restrictions (some ISPs block inbound ports), verify port forwarding rules, and confirm the host's firewall is permitting connections.
