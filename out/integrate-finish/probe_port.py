import socket

def free_port(start=8931):
    for p in range(start, start + 60):
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 0)
        try:
            s.bind(("127.0.0.1", p))
            return p
        except OSError:
            continue
        finally:
            s.close()
    raise RuntimeError("no free port in range")

if __name__ == "__main__":
    print(free_port(8931))
