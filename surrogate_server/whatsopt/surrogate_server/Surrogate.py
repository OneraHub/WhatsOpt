#
# Autogenerated by Thrift Compiler (0.11.0)
#
# DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
#
#  options string: py
#

from thrift.Thrift import TType, TMessageType, TFrozenDict, TException, TApplicationException
from thrift.protocol.TProtocol import TProtocolException
from thrift.TRecursive import fix_spec

import sys
import logging
from .ttypes import *
from thrift.Thrift import TProcessor
from thrift.transport import TTransport
all_structs = []


class Iface(object):
    def create_surrogate(self, surrogate_id, kind, xt, yt):
        """
        Parameters:
         - surrogate_id
         - kind
         - xt
         - yt
        """
        pass

    def predict_values(self, surrogate_id, x):
        """
        Parameters:
         - surrogate_id
         - x
        """
        pass

    def destroy_surrogate(self, surrogate_id):
        """
        Parameters:
         - surrogate_id
        """
        pass


class Client(Iface):
    def __init__(self, iprot, oprot=None):
        self._iprot = self._oprot = iprot
        if oprot is not None:
            self._oprot = oprot
        self._seqid = 0

    def create_surrogate(self, surrogate_id, kind, xt, yt):
        """
        Parameters:
         - surrogate_id
         - kind
         - xt
         - yt
        """
        self.send_create_surrogate(surrogate_id, kind, xt, yt)
        self.recv_create_surrogate()

    def send_create_surrogate(self, surrogate_id, kind, xt, yt):
        self._oprot.writeMessageBegin('create_surrogate', TMessageType.CALL, self._seqid)
        args = create_surrogate_args()
        args.surrogate_id = surrogate_id
        args.kind = kind
        args.xt = xt
        args.yt = yt
        args.write(self._oprot)
        self._oprot.writeMessageEnd()
        self._oprot.trans.flush()

    def recv_create_surrogate(self):
        iprot = self._iprot
        (fname, mtype, rseqid) = iprot.readMessageBegin()
        if mtype == TMessageType.EXCEPTION:
            x = TApplicationException()
            x.read(iprot)
            iprot.readMessageEnd()
            raise x
        result = create_surrogate_result()
        result.read(iprot)
        iprot.readMessageEnd()
        return

    def predict_values(self, surrogate_id, x):
        """
        Parameters:
         - surrogate_id
         - x
        """
        self.send_predict_values(surrogate_id, x)
        return self.recv_predict_values()

    def send_predict_values(self, surrogate_id, x):
        self._oprot.writeMessageBegin('predict_values', TMessageType.CALL, self._seqid)
        args = predict_values_args()
        args.surrogate_id = surrogate_id
        args.x = x
        args.write(self._oprot)
        self._oprot.writeMessageEnd()
        self._oprot.trans.flush()

    def recv_predict_values(self):
        iprot = self._iprot
        (fname, mtype, rseqid) = iprot.readMessageBegin()
        if mtype == TMessageType.EXCEPTION:
            x = TApplicationException()
            x.read(iprot)
            iprot.readMessageEnd()
            raise x
        result = predict_values_result()
        result.read(iprot)
        iprot.readMessageEnd()
        if result.success is not None:
            return result.success
        raise TApplicationException(TApplicationException.MISSING_RESULT, "predict_values failed: unknown result")

    def destroy_surrogate(self, surrogate_id):
        """
        Parameters:
         - surrogate_id
        """
        self.send_destroy_surrogate(surrogate_id)
        self.recv_destroy_surrogate()

    def send_destroy_surrogate(self, surrogate_id):
        self._oprot.writeMessageBegin('destroy_surrogate', TMessageType.CALL, self._seqid)
        args = destroy_surrogate_args()
        args.surrogate_id = surrogate_id
        args.write(self._oprot)
        self._oprot.writeMessageEnd()
        self._oprot.trans.flush()

    def recv_destroy_surrogate(self):
        iprot = self._iprot
        (fname, mtype, rseqid) = iprot.readMessageBegin()
        if mtype == TMessageType.EXCEPTION:
            x = TApplicationException()
            x.read(iprot)
            iprot.readMessageEnd()
            raise x
        result = destroy_surrogate_result()
        result.read(iprot)
        iprot.readMessageEnd()
        return


class Processor(Iface, TProcessor):
    def __init__(self, handler):
        self._handler = handler
        self._processMap = {}
        self._processMap["create_surrogate"] = Processor.process_create_surrogate
        self._processMap["predict_values"] = Processor.process_predict_values
        self._processMap["destroy_surrogate"] = Processor.process_destroy_surrogate

    def process(self, iprot, oprot):
        (name, type, seqid) = iprot.readMessageBegin()
        if name not in self._processMap:
            iprot.skip(TType.STRUCT)
            iprot.readMessageEnd()
            x = TApplicationException(TApplicationException.UNKNOWN_METHOD, 'Unknown function %s' % (name))
            oprot.writeMessageBegin(name, TMessageType.EXCEPTION, seqid)
            x.write(oprot)
            oprot.writeMessageEnd()
            oprot.trans.flush()
            return
        else:
            self._processMap[name](self, seqid, iprot, oprot)
        return True

    def process_create_surrogate(self, seqid, iprot, oprot):
        args = create_surrogate_args()
        args.read(iprot)
        iprot.readMessageEnd()
        result = create_surrogate_result()
        try:
            self._handler.create_surrogate(args.surrogate_id, args.kind, args.xt, args.yt)
            msg_type = TMessageType.REPLY
        except TTransport.TTransportException:
            raise
        except TApplicationException as ex:
            logging.exception('TApplication exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = ex
        except Exception:
            logging.exception('Unexpected exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = TApplicationException(TApplicationException.INTERNAL_ERROR, 'Internal error')
        oprot.writeMessageBegin("create_surrogate", msg_type, seqid)
        result.write(oprot)
        oprot.writeMessageEnd()
        oprot.trans.flush()

    def process_predict_values(self, seqid, iprot, oprot):
        args = predict_values_args()
        args.read(iprot)
        iprot.readMessageEnd()
        result = predict_values_result()
        try:
            result.success = self._handler.predict_values(args.surrogate_id, args.x)
            msg_type = TMessageType.REPLY
        except TTransport.TTransportException:
            raise
        except TApplicationException as ex:
            logging.exception('TApplication exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = ex
        except Exception:
            logging.exception('Unexpected exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = TApplicationException(TApplicationException.INTERNAL_ERROR, 'Internal error')
        oprot.writeMessageBegin("predict_values", msg_type, seqid)
        result.write(oprot)
        oprot.writeMessageEnd()
        oprot.trans.flush()

    def process_destroy_surrogate(self, seqid, iprot, oprot):
        args = destroy_surrogate_args()
        args.read(iprot)
        iprot.readMessageEnd()
        result = destroy_surrogate_result()
        try:
            self._handler.destroy_surrogate(args.surrogate_id)
            msg_type = TMessageType.REPLY
        except TTransport.TTransportException:
            raise
        except TApplicationException as ex:
            logging.exception('TApplication exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = ex
        except Exception:
            logging.exception('Unexpected exception in handler')
            msg_type = TMessageType.EXCEPTION
            result = TApplicationException(TApplicationException.INTERNAL_ERROR, 'Internal error')
        oprot.writeMessageBegin("destroy_surrogate", msg_type, seqid)
        result.write(oprot)
        oprot.writeMessageEnd()
        oprot.trans.flush()

# HELPER FUNCTIONS AND STRUCTURES


class create_surrogate_args(object):
    """
    Attributes:
     - surrogate_id
     - kind
     - xt
     - yt
    """


    def __init__(self, surrogate_id=None, kind=None, xt=None, yt=None,):
        self.surrogate_id = surrogate_id
        self.kind = kind
        self.xt = xt
        self.yt = yt

    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            if fid == 1:
                if ftype == TType.STRING:
                    self.surrogate_id = iprot.readString().decode('utf-8') if sys.version_info[0] == 2 else iprot.readString()
                else:
                    iprot.skip(ftype)
            elif fid == 2:
                if ftype == TType.I32:
                    self.kind = iprot.readI32()
                else:
                    iprot.skip(ftype)
            elif fid == 3:
                if ftype == TType.LIST:
                    self.xt = []
                    (_etype3, _size0) = iprot.readListBegin()
                    for _i4 in range(_size0):
                        _elem5 = []
                        (_etype9, _size6) = iprot.readListBegin()
                        for _i10 in range(_size6):
                            _elem11 = iprot.readDouble()
                            _elem5.append(_elem11)
                        iprot.readListEnd()
                        self.xt.append(_elem5)
                    iprot.readListEnd()
                else:
                    iprot.skip(ftype)
            elif fid == 4:
                if ftype == TType.LIST:
                    self.yt = []
                    (_etype15, _size12) = iprot.readListBegin()
                    for _i16 in range(_size12):
                        _elem17 = iprot.readDouble()
                        self.yt.append(_elem17)
                    iprot.readListEnd()
                else:
                    iprot.skip(ftype)
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('create_surrogate_args')
        if self.surrogate_id is not None:
            oprot.writeFieldBegin('surrogate_id', TType.STRING, 1)
            oprot.writeString(self.surrogate_id.encode('utf-8') if sys.version_info[0] == 2 else self.surrogate_id)
            oprot.writeFieldEnd()
        if self.kind is not None:
            oprot.writeFieldBegin('kind', TType.I32, 2)
            oprot.writeI32(self.kind)
            oprot.writeFieldEnd()
        if self.xt is not None:
            oprot.writeFieldBegin('xt', TType.LIST, 3)
            oprot.writeListBegin(TType.LIST, len(self.xt))
            for iter18 in self.xt:
                oprot.writeListBegin(TType.DOUBLE, len(iter18))
                for iter19 in iter18:
                    oprot.writeDouble(iter19)
                oprot.writeListEnd()
            oprot.writeListEnd()
            oprot.writeFieldEnd()
        if self.yt is not None:
            oprot.writeFieldBegin('yt', TType.LIST, 4)
            oprot.writeListBegin(TType.DOUBLE, len(self.yt))
            for iter20 in self.yt:
                oprot.writeDouble(iter20)
            oprot.writeListEnd()
            oprot.writeFieldEnd()
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(create_surrogate_args)
create_surrogate_args.thrift_spec = (
    None,  # 0
    (1, TType.STRING, 'surrogate_id', 'UTF8', None, ),  # 1
    (2, TType.I32, 'kind', None, None, ),  # 2
    (3, TType.LIST, 'xt', (TType.LIST, (TType.DOUBLE, None, False), False), None, ),  # 3
    (4, TType.LIST, 'yt', (TType.DOUBLE, None, False), None, ),  # 4
)


class create_surrogate_result(object):


    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('create_surrogate_result')
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(create_surrogate_result)
create_surrogate_result.thrift_spec = (
)


class predict_values_args(object):
    """
    Attributes:
     - surrogate_id
     - x
    """


    def __init__(self, surrogate_id=None, x=None,):
        self.surrogate_id = surrogate_id
        self.x = x

    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            if fid == 1:
                if ftype == TType.STRING:
                    self.surrogate_id = iprot.readString().decode('utf-8') if sys.version_info[0] == 2 else iprot.readString()
                else:
                    iprot.skip(ftype)
            elif fid == 2:
                if ftype == TType.LIST:
                    self.x = []
                    (_etype24, _size21) = iprot.readListBegin()
                    for _i25 in range(_size21):
                        _elem26 = []
                        (_etype30, _size27) = iprot.readListBegin()
                        for _i31 in range(_size27):
                            _elem32 = iprot.readDouble()
                            _elem26.append(_elem32)
                        iprot.readListEnd()
                        self.x.append(_elem26)
                    iprot.readListEnd()
                else:
                    iprot.skip(ftype)
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('predict_values_args')
        if self.surrogate_id is not None:
            oprot.writeFieldBegin('surrogate_id', TType.STRING, 1)
            oprot.writeString(self.surrogate_id.encode('utf-8') if sys.version_info[0] == 2 else self.surrogate_id)
            oprot.writeFieldEnd()
        if self.x is not None:
            oprot.writeFieldBegin('x', TType.LIST, 2)
            oprot.writeListBegin(TType.LIST, len(self.x))
            for iter33 in self.x:
                oprot.writeListBegin(TType.DOUBLE, len(iter33))
                for iter34 in iter33:
                    oprot.writeDouble(iter34)
                oprot.writeListEnd()
            oprot.writeListEnd()
            oprot.writeFieldEnd()
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(predict_values_args)
predict_values_args.thrift_spec = (
    None,  # 0
    (1, TType.STRING, 'surrogate_id', 'UTF8', None, ),  # 1
    (2, TType.LIST, 'x', (TType.LIST, (TType.DOUBLE, None, False), False), None, ),  # 2
)


class predict_values_result(object):
    """
    Attributes:
     - success
    """


    def __init__(self, success=None,):
        self.success = success

    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            if fid == 0:
                if ftype == TType.LIST:
                    self.success = []
                    (_etype38, _size35) = iprot.readListBegin()
                    for _i39 in range(_size35):
                        _elem40 = iprot.readDouble()
                        self.success.append(_elem40)
                    iprot.readListEnd()
                else:
                    iprot.skip(ftype)
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('predict_values_result')
        if self.success is not None:
            oprot.writeFieldBegin('success', TType.LIST, 0)
            oprot.writeListBegin(TType.DOUBLE, len(self.success))
            for iter41 in self.success:
                oprot.writeDouble(iter41)
            oprot.writeListEnd()
            oprot.writeFieldEnd()
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(predict_values_result)
predict_values_result.thrift_spec = (
    (0, TType.LIST, 'success', (TType.DOUBLE, None, False), None, ),  # 0
)


class destroy_surrogate_args(object):
    """
    Attributes:
     - surrogate_id
    """


    def __init__(self, surrogate_id=None,):
        self.surrogate_id = surrogate_id

    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            if fid == 1:
                if ftype == TType.STRING:
                    self.surrogate_id = iprot.readString().decode('utf-8') if sys.version_info[0] == 2 else iprot.readString()
                else:
                    iprot.skip(ftype)
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('destroy_surrogate_args')
        if self.surrogate_id is not None:
            oprot.writeFieldBegin('surrogate_id', TType.STRING, 1)
            oprot.writeString(self.surrogate_id.encode('utf-8') if sys.version_info[0] == 2 else self.surrogate_id)
            oprot.writeFieldEnd()
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(destroy_surrogate_args)
destroy_surrogate_args.thrift_spec = (
    None,  # 0
    (1, TType.STRING, 'surrogate_id', 'UTF8', None, ),  # 1
)


class destroy_surrogate_result(object):


    def read(self, iprot):
        if iprot._fast_decode is not None and isinstance(iprot.trans, TTransport.CReadableTransport) and self.thrift_spec is not None:
            iprot._fast_decode(self, iprot, [self.__class__, self.thrift_spec])
            return
        iprot.readStructBegin()
        while True:
            (fname, ftype, fid) = iprot.readFieldBegin()
            if ftype == TType.STOP:
                break
            else:
                iprot.skip(ftype)
            iprot.readFieldEnd()
        iprot.readStructEnd()

    def write(self, oprot):
        if oprot._fast_encode is not None and self.thrift_spec is not None:
            oprot.trans.write(oprot._fast_encode(self, [self.__class__, self.thrift_spec]))
            return
        oprot.writeStructBegin('destroy_surrogate_result')
        oprot.writeFieldStop()
        oprot.writeStructEnd()

    def validate(self):
        return

    def __repr__(self):
        L = ['%s=%r' % (key, value)
             for key, value in self.__dict__.items()]
        return '%s(%s)' % (self.__class__.__name__, ', '.join(L))

    def __eq__(self, other):
        return isinstance(other, self.__class__) and self.__dict__ == other.__dict__

    def __ne__(self, other):
        return not (self == other)
all_structs.append(destroy_surrogate_result)
destroy_surrogate_result.thrift_spec = (
)
fix_spec(all_structs)
del all_structs

