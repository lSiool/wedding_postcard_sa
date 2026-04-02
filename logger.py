import logging
from logging import StreamHandler

logger = logging.getLogger(__name__)
logger.addHandler(StreamHandler())
